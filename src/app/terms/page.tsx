"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, FileText, Shield, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StructuredData } from "@/components/ui/structured-data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

export default function TermsPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="organization" />
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/cookitnext_logo.png"
                  alt="CookGPT Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold text-foreground">CookGPT</span>
              </Link>
              
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Terms & Conditions
                </h1>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated on 16-09-2025 21:15:32</span>
                </div>
              </motion.div>

              {/* Terms Content */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-foreground flex items-center space-x-2">
                      <Scale className="w-6 h-6 text-primary" />
                      <span>Legal Agreement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        These Terms and Conditions, along with privacy policy or other terms ("Terms") constitute a binding
                        agreement by and between <strong className="text-foreground">PRANABESH SARKAR</strong>, ( "Website Owner" or "we" or "us" or "our") and
                        you ("you" or "your") and relate to your use of our website, goods (as applicable) or services (as
                        applicable) (collectively, "Services").
                      </p>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        By using our website and availing the Services, you agree that you have read and accepted these Terms
                        (including the Privacy Policy). We reserve the right to modify these Terms at any time and without
                        assigning any reason. It is your responsibility to periodically review these Terms to stay informed of
                        updates.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span>Terms of Use</span>
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">1. Account Registration:</strong> To access and use the Services, you agree to provide true, accurate and complete information to us
                            during and after registration, and you shall be responsible for all acts done through the use of your
                            registered account.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">2. No Warranty:</strong> Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness,
                            performance, completeness or suitability of the information and materials offered on this website
                            or through the Services, for any specific purpose. You acknowledge that such information and
                            materials may contain inaccuracies or errors and we expressly exclude liability for any such
                            inaccuracies or errors to the fullest extent permitted by law.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">3. Use at Your Own Risk:</strong> Your use of our Services and the website is solely at your own risk and discretion. You are
                            required to independently assess and ensure that the Services meet your requirements.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">4. Intellectual Property:</strong> The contents of the Website and the Services are proprietary to Us and you will not have any
                            authority to claim any intellectual property rights, title, or interest in its contents.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">5. Unauthorized Use:</strong> You acknowledge that unauthorized use of the Website or the Services may lead to action against
                            you as per these Terms or applicable laws.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">6. Payment:</strong> You agree to pay us the charges associated with availing the Services.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">7. Lawful Use:</strong> You agree not to use the website and/ or Services for any purpose that is unlawful, illegal or
                            forbidden by these Terms, or Indian or local laws that might apply to you.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">8. Third Party Links:</strong> You agree and acknowledge that website and the Services may contain links to other third party
                            websites. On accessing these links, you will be governed by the terms of use, privacy policy and
                            such other policies of such third party websites.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">9. Binding Contract:</strong> You understand that upon initiating a transaction for availing the Services you are entering into a
                            legally binding and enforceable contract with the us for the Services.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">10. Refund Policy:</strong> You shall be entitled to claim a refund of the payment made by you in case we are not able to
                            provide the Service. The timelines for such return and refund will be according to the specific
                            Service you have availed or within the time period provided in our policies (as applicable). In case
                            you do not raise a refund claim within the stipulated time, than this would make you ineligible for
                            a refund.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">11. Force Majeure:</strong> Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to
                            perform an obligation under these Terms if performance is prevented or delayed by a force majeure
                            event.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <Scale className="w-5 h-5 text-primary" />
                        <span>Governing Law & Jurisdiction</span>
                      </h2>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground leading-relaxed">
                          These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and
                          construed in accordance with the laws of India.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground leading-relaxed">
                          All disputes arising out of or in connection with these Terms shall be subject to the exclusive
                          jurisdiction of the courts in Cooch Behar, West Bengal.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span>Contact Information</span>
                      </h2>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground leading-relaxed">
                          All concerns or communications relating to these Terms must be communicated to us using the
                          contact information provided on this website.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Back to Home Button */}
              <motion.div variants={itemVariants} className="text-center mt-12">
                <Link href="/">
                  <Button size="lg" className="text-lg px-8 py-6 h-auto">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-muted/30 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Image
                  src="/cookitnext_logo.png"
                  alt="CookGPT Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-lg font-semibold text-foreground">CookGPT</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <a 
                  href="/cancellation" 
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancellation & Refund
                </a>
                <span>© 2024 CookGPT. All rights reserved. | Maintained by <a href="https://quantumbitlabs.in/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">QuantumBit Labs</a></span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
