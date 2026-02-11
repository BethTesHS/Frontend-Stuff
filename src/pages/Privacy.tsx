
import Layout from '@/components/Layout/Layout';
import { Shield, Lock, Eye, Users, FileText, Clock } from 'lucide-react';


const Privacy = () => {


  
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
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-lg text-gray-600">
                Last updated: January 2024
              </p>
            </div>

            {/* Content Sections */}
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  At Homed, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our property platform.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Information We Collect</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <Users className="w-5 h-5 text-primary-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    </div>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Name, email address, and phone number</li>
                      <li>• Property preferences and search history</li>
                      <li>• Location data (when permitted)</li>
                      <li>• Communication records with agents</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <Eye className="w-5 h-5 text-primary-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Automatically Collected</h3>
                    </div>
                    <ul className="text-gray-700 space-y-2">
                      <li>• IP address and browser information</li>
                      <li>• Device type and operating system</li>
                      <li>• Usage patterns and analytics data</li>
                      <li>• Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">How We Use Your Information</h2>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">We use your information to:</p>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Provide and improve our property search services</li>
                    <li>• Connect you with relevant property agents</li>
                    <li>• Send property alerts and notifications</li>
                    <li>• Analyze usage patterns to enhance user experience</li>
                    <li>• Comply with legal obligations</li>
                  </ul>
                </div>
              </div>

              {/* Information Sharing */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Information Sharing</h2>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">We may share your information with:</p>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>• Property agents and landlords when you express interest in properties</li>
                    <li>• Service providers who assist in operating our platform</li>
                    <li>• Legal authorities when required by law</li>
                  </ul>
                  <p className="text-primary-800 font-medium">We never sell your personal information to third parties.</p>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Rights</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Access your personal information',
                    'Correct inaccurate data',
                    'Request deletion of your data',
                    'Opt-out of marketing communications',
                    'Data portability',
                    'Withdraw consent'
                  ].map((right, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{right}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Contact */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Security</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <Lock className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Protected Information</span>
                    </div>
                    <p className="text-gray-700">
                      We implement industry-standard security measures including encryption, secure servers, and regular security audits.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Privacy Questions</span>
                    </div>
                    <div className="text-gray-700 space-y-1">
                      <p>Email: privacy@homed.uk</p>
                      <p>Phone: 0800 123 4567</p>
                      <p>Address: London, UK</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updates Notice */}
              <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="font-medium text-amber-800">Policy Updates</span>
                </div>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
