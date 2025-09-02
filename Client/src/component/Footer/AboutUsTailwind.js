/**
 * React Core Import
 */
import React from 'react';

/**
 * Animation Library for Smooth Transitions
 */
import { motion } from 'framer-motion';

/**
 * Theme Color Utilities for Dynamic Branding
 */
import { getPrimaryThemeColor, getSecondaryThemeColor } from '../../utils/themeColorsSimple';

/**
 * Team Member Asset Imports
 * SVG images for consistent team member representation
 */
import arjunImage from '../../assets/team/arjun.svg';
import priyaImage from '../../assets/team/priya.svg';
import vikramImage from '../../assets/team/vikram.svg';
import ananyaImage from '../../assets/team/ananya.svg';
import rajeshImage from '../../assets/team/rajesh.svg';
import meeraImage from '../../assets/team/meera.svg';

/**
 * About Us Page Component - Company Information and Team Showcase
 * 
 * Comprehensive company presentation page featuring:
 * - Hero section with company mission and values
 * - Detailed company story and background information
 * - Core values presentation with icon-based cards
 * - Interactive timeline showing company milestones
 * - Team member profiles with roles and descriptions
 * - Call-to-action section for customer engagement
 * - Dynamic theme color integration throughout
 * - Responsive design for all device sizes
 * - Smooth animations using Framer Motion
 * 
 * Key Features:
 * - Professional hero section with dynamic theme colors
 * - Storytelling approach to company background
 * - Visual value proposition with icon cards
 * - Interactive timeline (horizontal on desktop, vertical on mobile)
 * - Team showcase with hover effects and animations
 * - Responsive grid layouts for different screen sizes
 * - Smooth scroll animations with stagger effects
 * - Brand-consistent color scheme throughout
 * 
 * Content Sections:
 * - Hero: Company introduction and mission statement
 * - Story: Company founding principles and growth journey
 * - Values: Core business values with visual representations
 * - Timeline: Company milestones and achievements
 * - Team: Leadership profiles with photos and descriptions
 * - CTA: Customer engagement and action buttons
 * 
 * Animation Features:
 * - Fade-in-up animations for content sections
 * - Staggered container animations for grid layouts
 * - Hover effects on interactive elements
 * - Scale transitions on team member photos
 * - Smooth color transitions on buttons
 * 
 * Responsive Design:
 * - Mobile-first approach with breakpoint optimization
 * - Different timeline layouts for mobile vs desktop
 * - Responsive grid systems for team and values sections
 * - Optimized typography scaling across devices
 * - Touch-friendly interactions on mobile devices
 * 
 * Business Information:
 * - Company founding story and mission
 * - Core values and principles
 * - Team leadership profiles
 * - Company achievements and milestones
 * - Customer engagement messaging
 */

const AboutUsTailwind = React.memo(() => {
  /**
   * Dynamic Theme Color Integration
   * 
   * Retrieves current theme colors for consistent branding:
   * - primaryColor: Main brand color for headers and CTAs
   * - secondaryColor: Supporting color for accents and highlights
   */
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  /**
   * Animation Variants for Framer Motion
   * 
   * Defines reusable animation configurations:
   * - fadeInUp: Content slides up with fade effect
   * - staggerContainer: Staggers child element animations
   */
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  /**
   * Company Values Data Structure
   * 
   * Core business values with icons and descriptions:
   * - Quality First: Product quality commitment
   * - Innovation: Technology and trend leadership
   * - Customer Focus: Customer satisfaction priority
   * - Sustainability: Environmental responsibility
   */
  const values = [
    {
      icon: "🎯",
      title: "Quality First",
      description: "We source only the finest products that meet our rigorous quality standards."
    },
    {
      icon: "🚀",
      title: "Innovation",
      description: "Constantly evolving to bring you the latest trends and cutting-edge solutions."
    },
    {
      icon: "🤝",
      title: "Customer Focus",
      description: "Your satisfaction is our priority. We're here to serve you better every day."
    },
    {
      icon: "🌱",
      title: "Sustainability",
      description: "Committed to environmentally responsible practices in everything we do."
    }
  ];

  /**
   * Team Members Data Structure
   * 
   * Leadership team profiles with photos and descriptions:
   * - Name, role, image, and detailed description
   * - Represents diverse leadership across key business functions
   * - Indian names reflecting local market focus
   */
  const team = [
    {
      name: "Arjun Sharma",
      role: "Founder & CEO",
      image: arjunImage,
      description: "With over 15 years in e-commerce and retail, Arjun founded our company with a vision to transform online shopping in India."
    },
    {
      name: "Priya Patel",
      role: "Head of Technology",
      image: priyaImage,
      description: "Priya leads our tech innovation, bringing cutting-edge solutions to enhance customer experience across all platforms."
    },
    {
      name: "Vikram Malhotra",
      role: "Product Development Manager",
      image: vikramImage,
      description: "Vikram brings 10+ years of product expertise, ensuring we deliver high-quality products that exceed customer expectations."
    },
    {
      name: "Ananya Reddy",
      role: "Customer Success Manager",
      image: ananyaImage,
      description: "Ananya works tirelessly to ensure every customer has a seamless and delightful shopping experience with our brand."
    },
    {
      name: "Rajesh Iyer",
      role: "Operations Director",
      image: rajeshImage,
      description: "Rajesh oversees our logistics and supply chain, ensuring timely delivery and operational excellence across India."
    },
    {
      name: "Meera Krishnan",
      role: "Marketing Strategist",
      image: meeraImage,
      description: "Meera crafts our brand voice and marketing strategies, connecting our products with the right customers."
    }
  ];

  /**
   * Company Milestone Timeline
   * 
   * Key achievements and growth milestones:
   * - Chronological company development from 2022 to 2025
   * - Major business achievements and customer growth
   * - Expansion and service enhancement milestones
   */
  const milestones = [
    { year: "2022", event: "Company Founded", description: "Started with a small team and big dreams" },
    { year: "2023", event: "First 1000 Customers", description: "Reached our first major milestone" },
    { year: "2024", event: "Product Line Expansion", description: "Expanded to serve diverse customer needs" },
    { year: "2025", event: "50,000+ Happy Customers", description: "Growing community of satisfied customers" },
    { year: "2025", event: "Global Expansion", description: "Serving customers worldwide with enhanced services" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dynamic Brand Introduction */}
      <div className="relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-white">Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-white opacity-90 max-w-3xl mx-auto leading-relaxed">
              We're passionate about delivering exceptional products and experiences that make your life better.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story Section - Company Background and Mission */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: primaryColor }}></div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Company Story Content */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Founded on Innovation</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Our journey began with a simple belief: everyone deserves access to quality products that enhance their daily lives. 
                  What started as a small team with big dreams has grown into a trusted brand serving thousands of customers worldwide.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  We've built our reputation on three core principles: uncompromising quality, exceptional customer service, 
                  and continuous innovation. Every product we offer goes through rigorous testing to ensure it meets our high standards.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Today, we're proud to be a leading destination for customers who value quality, reliability, and outstanding service.
                </p>
              </div>
            </motion.div>

            {/* Visual Story Representation */}
            <motion.div variants={fadeInUp}>
              <div className="relative">
                <div className="bg-gray-50 rounded-2xl p-1">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                    alt="Our team working together"
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: primaryColor }}>50K+</div>
                    <div className="text-gray-600 font-medium">Happy Customers</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Our Values Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: primaryColor }}></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment to excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: primaryColor }}></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 px-4">
              Follow our path from humble beginnings to where we are today.
            </p>
          </motion.div>

          {/* Mobile-first design with different layouts for mobile and desktop */}
          <div className="relative">
            {/* Hidden on small screens, visible on md and up - Horizontal timeline */}
            <div className="hidden md:block">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5" style={{ backgroundColor: primaryColor + '40' }}></div>
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                      <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <span className="text-white px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: secondaryColor }}>
                            {milestone.year}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.event}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: primaryColor }}></div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Visible on small screens, hidden on md and up - Vertical timeline */}
            <div className="md:hidden">
              <div className="absolute left-4 top-0 h-full w-0.5" style={{ backgroundColor: primaryColor + '40' }}></div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="relative pl-12 ml-4"
                  >
                    <div className="absolute left-0 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: primaryColor }}></div>
                    <div className="bg-white rounded-xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      <span className="inline-block text-white px-3 py-1 rounded-full text-sm font-semibold mb-2" style={{ backgroundColor: primaryColor }}>
                        {milestone.year}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.event}</h3>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: primaryColor }}></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate professionals behind our success, bringing Indian innovation and excellence to serve you better every day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 transition-colors duration-300" 
                      style={{
                        '--hover-border-color': primaryColor
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'rgb(229, 231, 235)'; // border-gray-200
                      }}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{member.name}</h3>
                  <p className="font-semibold mb-4 text-center" style={{ color: primaryColor }}>{member.role}</p>
                  <p className="text-gray-600 text-center leading-relaxed">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <div className="rounded-2xl p-12 shadow-2xl text-white" style={{ backgroundColor: primaryColor }}>
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for quality products and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg"
                style={{ color: primaryColor }}
              >
                Shop Now
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white transition-all duration-300" 
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = primaryColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'white';
                }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

AboutUsTailwind.displayName = 'AboutUsTailwind';

export default AboutUsTailwind;
