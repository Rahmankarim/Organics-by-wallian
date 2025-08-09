import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#355E3B] mb-4">Privacy Policy</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <p className="text-gray-600">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact us. This may include your name, email address, phone number, 
                shipping address, and payment information.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Information</h4>
              <p className="text-gray-600">
                We automatically collect information about how you use our website, including your IP address, 
                browser type, pages visited, and the time spent on our site.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cookies and Similar Technologies</h4>
              <p className="text-gray-600">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and deliver targeted content and advertisements.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Send you promotional emails and marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>With service providers who help us operate our business</li>
              <li>To comply with legal obligations or respond to legal requests</li>
              <li>To protect our rights, property, or safety, or that of others</li>
              <li>In connection with a business transaction (merger, acquisition, etc.)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-gray-600">
                To exercise these rights, please contact us at privacy@luxurydryfruits.com.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">6. Cookies Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Types of Cookies We Use</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Necessary Cookies:</strong> Essential for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization</li>
              </ul>
            </div>
            <p className="text-gray-600">
              You can manage your cookie preferences through our cookie consent banner or your browser settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">7. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our website may contain links to third-party websites or services. We are not responsible 
              for the privacy practices of these third parties. We encourage you to read their privacy 
              policies before providing any personal information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">8. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our website is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you believe we have collected 
              information from a child under 13, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">9. International Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information in accordance 
              with applicable data protection laws.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">10. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We may update this privacy policy from time to time. We will notify you of any material 
              changes by posting the new policy on our website and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <Card className="bg-[#355E3B] text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="mb-4">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@luxurydryfruits.com</p>
              <p><strong>Phone:</strong> 1-800-DRY-FRUIT</p>
              <p><strong>Address:</strong> 123 Luxury Street, Premium City, PC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
