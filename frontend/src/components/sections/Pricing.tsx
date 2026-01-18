"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { planService } from "@/services/plan.service"
import { subscriptionService } from "@/services/subscription.service"
import { Plan } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

// UI specific interface for display
interface PricingTier {
  id: string; // Group ID (e.g. 'creator')
  name: string;
  description: string;
  features: string[];
  popular?: boolean;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  price: {
    monthly: number;
    yearly: number;
  };
}

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const { user } = useAuth()
  const router = useRouter()
  // Use the custom toast hook
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await planService.getPlans()
        
        if (!plans || plans.length === 0) {
           setTiers([])
           return
        }

        // Map backend plans to UI tiers
        // In a real app, you might group these by name or metadata
        // For this demo, we'll assume the backend returns 3 active plans (Creator, Pro, Publisher)
        
        const transformedTiers: PricingTier[] = [
             {
                id: "creator",
                name: "Creator Plan",
                price: { monthly: 29, yearly: 290 },
                description: "For individuals.",
                features: [
                  "1,000 Subscribers",
                  "Basic Analytics",
                  "Email Support",
                  "Standard Content Gating"
                ],
                monthlyPriceId: plans.find(p => p.slug?.includes('creator') && p.interval === 'month')?.id,
                yearlyPriceId: plans.find(p => p.slug?.includes('creator') && p.interval === 'year')?.id,
              },
              {
                id: "pro",
                name: "Pro Plan",
                price: { monthly: 79, yearly: 790 },
                popular: true,
                description: "For growing businesses.",
                features: [
                  "10,000 Subscribers",
                  "No Transaction Fees",
                  "Advanced Analytics",
                  "Priority Support",
                  "Custom Domain"
                ],
                monthlyPriceId: plans.find(p => p.slug?.includes('pro') && p.interval === 'month')?.id,
                yearlyPriceId: plans.find(p => p.slug?.includes('pro') && p.interval === 'year')?.id,
              },
              {
                id: "publisher",
                name: "Publisher Plan",
                price: { monthly: 299, yearly: 2990 },
                description: "For organizations.",
                features: [
                  "Unlimited Subscribers",
                  "Dedicated Account Manager",
                  "SSO & API Access",
                  "White-labeling",
                  "99.9% Uptime SLA"
                ],
                monthlyPriceId: plans.find(p => p.slug?.includes('publisher') && p.interval === 'month')?.id,
                yearlyPriceId: plans.find(p => p.slug?.includes('publisher') && p.interval === 'year')?.id,
              }
        ]
        setTiers(transformedTiers)

      } catch (error) {
        console.error("Failed to fetch plans", error)
        toast("Failed to load pricing. Please try again later.", { type: "error" })
        setTiers([]) 
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSubscribe = async (tier: PricingTier) => {
    if (!user) {
      router.push("/register")
      return
    }

    try {
      setProcessingId(tier.id)
      const priceId = billingCycle === "monthly" ? tier.monthlyPriceId : tier.yearlyPriceId
      
      if (!priceId) {
          toast("Price not available for this cycle", { type: "error" })
          return
      }

      const { url } = await subscriptionService.createCheckoutSession(priceId)
      window.location.href = url
    } catch (error) {
      console.error("Checkout failed", error)
      toast("Failed to start checkout", { type: "error" })
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
      return (
          <section className="py-24 bg-[#F8F9FB] flex items-center justify-center min-h-[600px]">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </section>
      )
  }

  return (
    <section id="pricing" className="py-24 bg-[#F8F9FB] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] leading-none font-serif text-slate-900 opacity-[0.03] select-none pointer-events-none z-0">
            03
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight relative z-10">
            Simple, transparent pricing.
          </h2>
          <p className="text-lg text-slate-500 font-sans">
            Choose the plan that fits your business needs. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex justify-center pt-8">
            <div className="bg-white border border-slate-200 p-1 rounded-full shadow-sm flex items-center relative">
               <button
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-colors relative z-10",
                    billingCycle === "monthly" ? "text-white" : "text-slate-500 hover:text-slate-900"
                  )}
               >
                 Monthly
               </button>
               <button
                  onClick={() => setBillingCycle("yearly")}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-colors relative z-10",
                    billingCycle === "yearly" ? "text-white" : "text-slate-500 hover:text-slate-900"
                  )}
               >
                 Yearly
               </button>
               <motion.div
                  layoutId="billingCycle"
                  className="absolute top-1 bottom-1 bg-slate-900 rounded-full z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                  style={{
                    left: billingCycle === "monthly" ? "4px" : "50%",
                    width: billingCycle === "monthly" ? "calc(50% - 4px)" : "calc(50% - 4px)",
                    right: billingCycle === "yearly" ? "4px" : "auto",
                  }}
               />
            </div>
             {billingCycle === "yearly" && (
                 <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-4 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 self-center"
                 >
                    Save 20%
                 </motion.span>
             )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {tiers.length === 0 && !loading ? (
             <div className="col-span-3 text-center py-12">
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl inline-flex flex-col items-center max-w-md">
                   <h3 className="font-bold text-lg mb-2">Service Unavailable</h3>
                   <p className="text-sm">Unable to load pricing plans at the moment. Please try again later.</p>
                </div>
             </div>
          ) : (
            tiers.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "relative bg-white rounded-[32px] p-8 border hover:shadow-prism transition-shadow duration-300",
                tier.popular ? "border-indigo-600 ring-4 ring-indigo-600/5 shadow-xl z-10" : "border-slate-100 shadow-sm"
              )}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide shadow-lg shadow-indigo-600/30">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-500 text-sm h-10">{tier.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-serif text-slate-900">
                    ${billingCycle === "monthly" ? tier.price.monthly : tier.price.yearly}
                </span>
                <span className="text-slate-400 font-medium">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="mt-0.5 min-w-[18px] h-[18px] rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        {feature}
                    </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(tier)}
                disabled={processingId === tier.id}
                className={cn(
                    "w-full h-12 rounded-full font-medium flex items-center justify-center transition-all duration-200",
                    tier.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-100",
                    processingId === tier.id && "opacity-70 cursor-not-allowed"
                )}
              >
                {processingId === tier.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    "Get Started"
                )}
              </button>
            </motion.div>
          ))
        )}
        </div>
      </div>
    </section>
  )
}
