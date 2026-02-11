
import Layout from '@/components/Layout/Layout';
import { FileText, Scale, Shield, Users, AlertCircle, Gavel } from 'lucide-react';

const Terms = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            {/* Title Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-lg text-gray-600">
                Last updated: January 2024
              </p>
            </div>

            {/* Content Sections */}
            <div className="prose prose-lg max-w-none">
              {/* Agreement to Terms */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Agreement to Terms</h2>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                  <p className="text-gray-700">
                    By accessing and using Homed, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </div>

              {/* Use License & User Accounts */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Use License</h2>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <Scale className="w-5 h-5 text-primary-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Permitted Use</h3>
                    </div>
                    <p className="text-gray-700 mb-4">Permission is granted for personal, non-commercial use only. You may not:</p>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Modify or copy the materials</li>
                      <li>• Use for commercial purposes</li>
                      <li>• Reverse engineer software</li>
                      <li>• Remove proprietary notations</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">User Accounts</h2>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <Users className="w-5 h-5 text-primary-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Account Responsibility</h3>
                    </div>
                    <p className="text-gray-700">
                      When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and all account activities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Listings */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Listings</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">Users who list properties must:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Have legal right to list the property',
                      'Provide accurate property information',
                      'Use genuine, recent photographs',
                      'Comply with housing laws and regulations'
                    ].map((requirement, index) => (
                      <div key={index} className="bg-white rounded-lg border border-green-200 p-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">{requirement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prohibited Uses */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Prohibited Uses</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-800">You may not use our service for:</span>
                  </div>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Any unlawful purpose or to solicit unlawful acts</li>
                    <li>• Violating international, federal, or local laws</li>
                    <li>• Infringing intellectual property rights</li>
                    <li>• Harassment, abuse, or discrimination</li>
                    <li>• Submitting false or misleading information</li>
                  </ul>
                </div>
              </div>

              {/* Content & Privacy Policy */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Content</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-gray-700">
                      Our service allows you to post and share content. You are responsible for all content you post to the service and must ensure it complies with our terms.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacy Policy</h2>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <Shield className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-800">Your Privacy Matters</span>
                    </div>
                    <p className="text-gray-700">
                      Please review our Privacy Policy to understand how we collect, use, and protect your information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Terms */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Termination</h2>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <p className="text-gray-700">
                      We may terminate or suspend your account immediately, without prior notice, for any reason including breach of these Terms.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Governing Law</h2>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <Gavel className="w-5 h-5 text-indigo-600 mr-2" />
                      <span className="font-medium text-indigo-800">UK Law</span>
                    </div>
                    <p className="text-gray-700">
                      These Terms are governed by the laws of the United Kingdom, without regard to conflict of law provisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer & Liability */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Disclaimer & Limitation of Liability</h2>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Disclaimer</h3>
                      <p className="text-gray-700 text-sm">
                        Information is provided "as is". We exclude all representations and warranties to the fullest extent permitted by law.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Liability Limitation</h3>
                      <p className="text-gray-700 text-sm">
                        We shall not be liable for indirect, incidental, special, consequential, or punitive damages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changes & Contact */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Changes to Terms</h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <p className="text-gray-700">
                      We reserve the right to modify these Terms at any time. Material changes will be notified with at least 30 days notice.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="text-gray-700 space-y-2">
                      <p><strong>Email:</strong> legal@homed.uk</p>
                      <p><strong>Phone:</strong> 0800 123 4567</p>
                      <p><strong>Address:</strong> London, UK SW1A 1AA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
