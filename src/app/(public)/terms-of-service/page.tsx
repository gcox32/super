import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: January 15, 2024
          </p>
        </section>

        {/* Content */}
        <section className="px-4 md:px-6 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using the Super Soldier Program application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Permission is granted to temporarily use the Super Soldier Program for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained in the application</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">3. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials on the Super Soldier Program are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">4. Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Super Soldier Program or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the application, even if Super Soldier Program or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials appearing in the Super Soldier Program could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its application are accurate, complete, or current. We may make changes to the materials contained on its application at any time without notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">6. Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              We have not reviewed all of the sites linked to our application and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Super Soldier Program. Use of any such linked website is at the user's own risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">7. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may revise these terms of service for its application at any time without notice. By using this application you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms and conditions are governed by and construed in accordance with applicable laws. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
