"use client"

import { Mail, Phone, MapPin, Clock, MessageCircle, Instagram, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <a href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </a>
          </li>
          <li className="text-muted-foreground">/</li>
          <li className="text-foreground font-medium">Contact Us</li>
        </ol>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-12">
          We'd love to hear from you. Get in touch with us for any inquiries.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-muted-foreground mb-2">Available Monday to Saturday, 9:00 AM to 6:00 PM</p>
                <a href="tel:+213770874393" className="text-primary font-medium hover:underline">
                  0770 874 393
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-muted-foreground mb-2">Send us your questions or concerns</p>
                <a href="mailto:petsmaniaanimalerie@gmail.com" className="text-primary font-medium hover:underline">
                  petsmaniaanimalerie@gmail.com
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visit Us</h3>
                <p className="text-muted-foreground">
                  Bordj Bou Arreridj, RUE F, Algeria
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Business Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Saturday: 9:00 AM - 6:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="Your full name" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+213 XXX XXX XXX" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message..."
                  rows={5}
                  required
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>

        {/* Google Map */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Location</h2>
          <div className="rounded-lg overflow-hidden border border-border shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7985.718726677108!2d4.774855!3d36.080875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128cbd547e5e75bf%3A0xeddc6d390870c024!2sPetsmania%20Animalerie!5e1!3m2!1sen!2sdz!4v1769769242973!5m2!1sen!2sdz"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Connect With Us</h2>
          <p className="text-muted-foreground mb-6">Follow us on social media for updates and promotions</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="outline" asChild>
              <a
                href="https://www.instagram.com/petsmania_341"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-4 h-4 mr-2" />
                @petsmania_341
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://wa.me/0770874393" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.tiktok.com/@petsmania345"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Music className="w-4 h-4 mr-2" />
                @petsmania345
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
