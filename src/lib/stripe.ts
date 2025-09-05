import Stripe from 'stripe'
import { salonOperations } from './supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: {
    session_duration: number // minutes
    max_ai_uses: number
    max_active_sessions: number
    analytics: boolean
    custom_branding: boolean
    priority_support: boolean
  }
}

// Define subscription plans
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'price_basic_monthly', // Replace with actual Stripe price ID
    name: 'Basic',
    price: 2900, // $29.00 in cents
    currency: 'usd',
    interval: 'month',
    features: {
      session_duration: 20,
      max_ai_uses: 3,
      max_active_sessions: 10,
      analytics: false,
      custom_branding: false,
      priority_support: false,
    },
  },
  professional: {
    id: 'price_professional_monthly', // Replace with actual Stripe price ID
    name: 'Professional',
    price: 5900, // $59.00 in cents
    currency: 'usd',
    interval: 'month',
    features: {
      session_duration: 30,
      max_ai_uses: 5,
      max_active_sessions: 25,
      analytics: true,
      custom_branding: false,
      priority_support: false,
    },
  },
  premium: {
    id: 'price_premium_monthly', // Replace with actual Stripe price ID
    name: 'Premium',
    price: 9900, // $99.00 in cents
    currency: 'usd',
    interval: 'month',
    features: {
      session_duration: 60,
      max_ai_uses: 10,
      max_active_sessions: 50,
      analytics: true,
      custom_branding: true,
      priority_support: true,
    },
  },
}

export class StripeManager {
  // Create a new customer
  static async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: metadata || {},
      })
      return customer
    } catch (error) {
      console.error('Failed to create Stripe customer:', error)
      throw error
    }
  }

  // Create checkout session for subscription
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: metadata || {},
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      })
      return session
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      throw error
    }
  }

  // Create customer portal session
  static async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      return session
    } catch (error) {
      console.error('Failed to create portal session:', error)
      throw error
    }
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      return subscription
    } catch (error) {
      console.error('Failed to get subscription:', error)
      throw error
    }
  }

  // Update subscription
  static async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, updates)
      return subscription
    } catch (error) {
      console.error('Failed to update subscription:', error)
      throw error
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: atPeriodEnd,
      })
      return subscription
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw error
    }
  }

  // Get customer subscriptions
  static async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      })
      return subscriptions.data
    } catch (error) {
      console.error('Failed to get customer subscriptions:', error)
      throw error
    }
  }

  // Handle webhook events
  static async handleWebhook(body: string, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    try {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
          
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
          
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
          
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break
          
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Webhook handling failed:', error)
      throw error
    }
  }

  // Handle subscription created
  private static async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customerId = subscription.customer as string
      const subscriptionId = subscription.id
      
      // Get the plan details from the subscription
      const priceId = subscription.items.data[0]?.price.id
      const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === priceId)
      
      if (!plan) {
        console.error('Unknown price ID:', priceId)
        return
      }

      // Update salon with subscription details
      const salon = await salonOperations.getByStripeCustomerId(customerId)
      if (salon) {
        await salonOperations.update(salon.id, {
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          session_duration: plan.features.session_duration,
          max_ai_uses: plan.features.max_ai_uses,
        })
      }
      
      console.log(`Subscription created for customer ${customerId}`)
    } catch (error) {
      console.error('Failed to handle subscription created:', error)
    }
  }

  // Handle subscription updated
  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customerId = subscription.customer as string
      const subscriptionId = subscription.id
      const status = subscription.status
      
      // Map Stripe status to our status
      let subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due'
      switch (status) {
        case 'active':
          subscriptionStatus = 'active'
          break
        case 'past_due':
          subscriptionStatus = 'past_due'
          break
        case 'canceled':
        case 'unpaid':
          subscriptionStatus = 'cancelled'
          break
        default:
          subscriptionStatus = 'inactive'
      }

      // Get the plan details
      const priceId = subscription.items.data[0]?.price.id
      const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === priceId)
      
      // Update salon
      const salon = await salonOperations.getByStripeCustomerId(customerId)
      if (salon) {
        const updates: any = {
          subscription_status: subscriptionStatus,
        }
        
        if (plan) {
          updates.session_duration = plan.features.session_duration
          updates.max_ai_uses = plan.features.max_ai_uses
        }
        
        await salonOperations.update(salon.id, updates)
      }
      
      console.log(`Subscription updated for customer ${customerId}: ${status}`)
    } catch (error) {
      console.error('Failed to handle subscription updated:', error)
    }
  }

  // Handle subscription deleted
  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customerId = subscription.customer as string
      
      // Update salon status
      const salon = await salonOperations.getByStripeCustomerId(customerId)
      if (salon) {
        await salonOperations.update(salon.id, {
          subscription_status: 'cancelled',
        })
      }
      
      console.log(`Subscription deleted for customer ${customerId}`)
    } catch (error) {
      console.error('Failed to handle subscription deleted:', error)
    }
  }

  // Handle payment succeeded
  private static async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string
      
      // Ensure salon is marked as active
      const salon = await salonOperations.getByStripeCustomerId(customerId)
      if (salon && salon.subscription_status !== 'active') {
        await salonOperations.update(salon.id, {
          subscription_status: 'active',
        })
      }
      
      console.log(`Payment succeeded for customer ${customerId}`)
    } catch (error) {
      console.error('Failed to handle payment succeeded:', error)
    }
  }

  // Handle payment failed
  private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string
      
      // Mark salon as past due
      const salon = await salonOperations.getByStripeCustomerId(customerId)
      if (salon) {
        await salonOperations.update(salon.id, {
          subscription_status: 'past_due',
        })
      }
      
      console.log(`Payment failed for customer ${customerId}`)
    } catch (error) {
      console.error('Failed to handle payment failed:', error)
    }
  }

  // Get usage-based pricing (if needed for future)
  static async createUsageRecord(subscriptionItemId: string, quantity: number): Promise<Stripe.UsageRecord> {
    try {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
      })
      return usageRecord
    } catch (error) {
      console.error('Failed to create usage record:', error)
      throw error
    }
  }
}

export default stripe
