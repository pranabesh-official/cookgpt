"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, FileText, RefreshCw, Shield, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
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

export default function CancellationPage() {
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
                    <RefreshCw className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Cancellation & Refund Policy
                </h1>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated on 16-09-2025 21:53:57</span>
                </div>
              </motion.div>

              {/* Policy Content */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-foreground flex items-center space-x-2">
                      <Shield className="w-6 h-6 text-primary" />
                      <span>Our Liberal Cancellation Policy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">PRANABESH SARKAR</strong> believes in helping its customers as far as possible, and has therefore a liberal
                        cancellation policy. Under this policy:
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>Cancellation Guidelines</span>
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                          <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">Immediate Cancellation:</strong> Cancellations will be considered only if the request is made immediately after placing the order.
                                However, the cancellation request may not be entertained if the orders have been communicated to the
                                vendors/merchants and they have initiated the process of shipping them.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-orange-500">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">Perishable Items:</strong> PRANABESH SARKAR does not accept cancellation requests for perishable items like flowers,
                                eatables etc. However, refund/replacement can be made if the customer establishes that the quality of
                                product delivered is not good.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span>Defective or Damaged Items</span>
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            In case of receipt of damaged or defective items please report the same to our Customer Service team.
                            The request will, however, be entertained once the merchant has checked and determined the same at his
                            own end. This should be reported within <strong className="text-foreground">only same day</strong> of receipt of the products.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the
                            notice of our customer service within <strong className="text-foreground">only same day</strong> of receiving the product. The Customer
                            Service Team after looking into your complaint will take an appropriate decision.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground leading-relaxed">
                            In case of complaints regarding products that come with a warranty from manufacturers, please refer
                            the issue to them.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        <span>Refund Processing</span>
                      </h2>
                      
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Refund Timeline</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          In case of any Refunds approved by the PRANABESH SARKAR, it'll take <strong className="text-foreground">16-30 Days</strong> for the refund to be processed to the end customer.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span>Important Notes</span>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h3 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Time Sensitive</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            All complaints must be reported within the same day of receiving the product to be considered for refund or replacement.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h3 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span>Quality Check</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Merchants will verify the condition of products before approving any refund or replacement requests.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h3 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span>Warranty Items</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Products with manufacturer warranty should be addressed directly with the manufacturer.
                          </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h3 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 text-primary" />
                            <span>Processing Time</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Approved refunds will be processed within 16-30 days from the date of approval.
                          </p>
                        </div>
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
                  href="/terms" 
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Terms & Conditions
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
