import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Key,
  FileText,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Home,
  User,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

import {
  verifyTenancyApi,
  SubmitVerificationPayload,
  DocumentType,
} from "@/services/verifyTenancyApi";

interface MultiStepWizardProps {
  onComplete: () => void;
}

const VerifyTenancy = ({ onComplete }: MultiStepWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [localFiles, setLocalFiles] = useState<
    { type: DocumentType; file: File }[]
  >([]);

  const [formData, setFormData] = useState<SubmitVerificationPayload>({
    verificationMethod: "manual",
    tenantFullName: "",
    isPresentTenancy: true,
    startDate: "",
    endDate: "",
    documentPaths: [],
    propertyAddress: "",
    agentPin: "",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const checkRedirection = async () => {
      const res = await verifyTenancyApi.shouldRedirectToDashboard();
      if (res.data.shouldRedirect) {
        navigate(res.data.target);
      }
    };
    checkRedirection();
  }, [navigate]);

  const updateField = (field: keyof SubmitVerificationPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileQueue = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalFiles((prev) => [
      ...prev.filter((f) => f.type !== type),
      { type, file },
    ]);
    toast.info(`${type.replace("_", " ")} added to queue.`);
  };

  const removeLocalFile = (type: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.type !== type));
  };

  const validatePinAndMove = async () => {
    if (!formData.agentPin) return toast.error("Please enter a PIN");
    setIsSubmitting(true);
    try {
      const res = await verifyTenancyApi.validatePin(formData.agentPin);
      if (res.data.isValid) {
        setFormData((prev) => ({
          ...prev,
          propertyAddress: res.data.propertyAddress,
          landlordName: res.data.agentName,
          landlordEmail: res.data.agentEmail,
          landlordPhone: res.data.agentPhone,
        }));
        setCurrentStep(5);
      } else {
        toast.error("Invalid Agent PIN");
      }
    } catch (err) {
      toast.error("Verification server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalSubmission = async () => {
    setIsSubmitting(true);
    try {
      const uploadedPaths = [];
      for (const item of localFiles) {
        const uploadRes = await verifyTenancyApi.uploadDocument(
          item.file,
          item.type,
        );
        uploadedPaths.push({ type: item.type, path: uploadRes.data.file_path });
      }

      const finalPayload = { ...formData, documentPaths: uploadedPaths };
      await verifyTenancyApi.submitVerification(finalPayload);
      await verifyTenancyApi.getStatus();

      toast.success("Verification submitted for review!");
      onComplete();
    } catch (err) {
      toast.error("Submission failed. Check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canMoveForward = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) {
      return formData.verificationMethod === "pin"
        ? !!formData.agentPin
        : !!formData.propertyAddress;
    }
    if (currentStep === 3) return !!formData.tenantFullName;
    if (currentStep === 4) {
      const hasTenancy = localFiles.some((f) => f.type === "tenancy_agreement");
      const hasCouncil = localFiles.some((f) => f.type === "council_tax");
      const hasSecondary = localFiles.some((f) =>
        ["driving_licence", "bank_statement", "passport"].includes(f.type),
      );
      const datesValid = formData.isPresentTenancy
        ? !!formData.startDate
        : !!formData.startDate && !!formData.endDate;
      return hasTenancy && hasCouncil && hasSecondary && datesValid;
    }
    return true;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Verify Your Tenancy
        </h1>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card className="border-border bg-card shadow-xl overflow-hidden rounded-xl">
        <CardContent className="p-5 md:p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Choose a path
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select how you'd like to link your property.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "pin",
                    icon: Key,
                    title: "Agent PIN",
                    desc: "Instant verification via agent code.",
                  },
                  {
                    id: "manual",
                    icon: FileText,
                    title: "Manual Upload",
                    desc: "Verify using tenancy documents.",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      updateField(
                        "verificationMethod",
                        item.id as "pin" | "manual",
                      )
                    }
                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all group ${
                      formData.verificationMethod === item.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-background hover:border-primary/30"
                    }`}
                  >
                    <item.icon
                      className={`h-8 w-8 mb-3 ${formData.verificationMethod === item.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <h4 className="font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.desc}
                    </p>
                    {formData.verificationMethod === item.id && (
                      <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Property Details
                </h3>
              </div>
              {formData.verificationMethod === "pin" ? (
                <div className="space-y-2">
                  <Label htmlFor="agentPin">Unique Agent PIN</Label>
                  <Input
                    id="agentPin"
                    placeholder="Enter 4-6 digit PIN"
                    className="text-lg font-mono bg-background text-foreground"
                    value={formData.agentPin}
                    onChange={(e) => updateField("agentPin", e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="address">Full Property Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g. 221B Baker Street, London, NW1 6XE"
                    className="bg-background text-foreground"
                    value={formData.propertyAddress}
                    onChange={(e) =>
                      updateField("propertyAddress", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Tenant Identity
                </h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Legal Name</Label>
                <Input
                  id="fullName"
                  placeholder="As it appears on your ID"
                  className="bg-background text-foreground"
                  value={formData.tenantFullName}
                  onChange={(e) =>
                    updateField("tenantFullName", e.target.value)
                  }
                />
              </div>
              <Alert className="bg-muted/50 border-none">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs text-muted-foreground">
                  Ensure your name matches your tenancy agreement exactly.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Compliance Evidence
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please provide the following documents and details.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tenancy Status</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <span
                      className={`text-xs ${!formData.isPresentTenancy ? "font-bold text-foreground" : "text-muted-foreground"}`}
                    >
                      Past
                    </span>
                    <Switch
                      checked={formData.isPresentTenancy}
                      onCheckedChange={(val) =>
                        updateField("isPresentTenancy", val)
                      }
                    />
                    <span
                      className={`text-xs ${formData.isPresentTenancy ? "font-bold text-foreground" : "text-muted-foreground"}`}
                    >
                      Present
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rent (£ GBP)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-background text-foreground"
                    value={formData.monthlyRent}
                    onChange={(e) => updateField("monthlyRent", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    className="bg-background text-foreground block w-full"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    End Date {!formData.isPresentTenancy && "(Required)"}
                  </Label>
                  <Input
                    type="date"
                    disabled={formData.isPresentTenancy}
                    className="bg-background text-foreground block w-full disabled:opacity-50"
                    value={formData.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-3">
                {[
                  {
                    label: "Tenancy Agreement",
                    type: "tenancy_agreement",
                    req: "Required",
                  },
                  {
                    label: "Council Tax",
                    type: "council_tax",
                    req: "Required",
                  },
                  {
                    label: "Utility Bill",
                    type: "utility_bill",
                    req: "Optional",
                  },
                  {
                    label: "Secondary ID",
                    type: "secondary",
                    req: "1 Required",
                  },
                ].map((doc) => {
                  const types =
                    doc.type === "secondary"
                      ? ["driving_licence", "bank_statement", "passport"]
                      : [doc.type];
                  const queuedFile = localFiles.find((f) =>
                    types.includes(f.type),
                  );

                  return (
                    <div
                      key={doc.type}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {doc.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {doc.req}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {queuedFile ? (
                          <>
                            <Badge className="bg-green-500/10 text-green-600 border-none">
                              Queued
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => removeLocalFile(queuedFile.type)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {doc.type === "secondary" ? (
                              [
                                "driving_licence",
                                "bank_statement",
                                "passport",
                              ].map((t) => (
                                <Button
                                  key={t}
                                  variant="outline"
                                  size="sm"
                                  className="relative text-[10px] h-7 px-2"
                                >
                                  {t.split("_")[0]}
                                  <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) =>
                                      handleFileQueue(e, t as DocumentType)
                                    }
                                  />
                                </Button>
                              ))
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="relative px-4"
                              >
                                Upload
                                <input
                                  type="file"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) =>
                                    handleFileQueue(e, doc.type as DocumentType)
                                  }
                                />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Review Submission
                </h3>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-medium">
                    Method
                  </span>
                  <Badge variant="outline" className="text-foreground">
                    {formData.verificationMethod.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2 gap-4">
                  <span className="text-muted-foreground font-medium">
                    Address
                  </span>
                  <span className="text-foreground text-right truncate">
                    {formData.propertyAddress}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2 gap-4">
                  <span className="text-muted-foreground font-medium">
                    Tenant
                  </span>
                  <span className="text-foreground text-right">
                    {formData.tenantFullName || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Files
                  </span>
                  <span className="text-foreground">
                    {localFiles.length} Pending
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/20 p-5 md:p-6 flex flex-col sm:flex-row gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() =>
                setCurrentStep((prev) =>
                  formData.verificationMethod === "pin" && prev === 5
                    ? 2
                    : prev - 1,
                )
              }
              className="w-full sm:w-auto order-2 sm:order-1 bg-background text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}
          <Button
            disabled={!canMoveForward() || isSubmitting}
            onClick={
              currentStep === 2 && formData.verificationMethod === "pin"
                ? validatePinAndMove
                : currentStep === 5
                  ? finalSubmission
                  : () => setCurrentStep((prev) => prev + 1)
            }
            className="w-full sm:ml-auto order-1 sm:order-2 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : currentStep === 5 ? (
              "Confirm & Submit"
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyTenancy;
