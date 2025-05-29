# Homepage Documentation

## Overview
The VadisAI homepage serves as the primary landing page for the AI-powered collaboration platform. It's designed to showcase the platform's capabilities for film and media production, targeting Production Companies, Brands/Agencies, Financiers, and Individual Creators.

## File Structure
- **Location**: `client/src/pages/landing.tsx`
- **Dependencies**: React hooks, UI components, Lucide React icons, React Icons, asset imports

## Component Architecture

### State Management
The landing page uses React's `useState` hooks to manage:
- `selectedRole`: Currently selected user role/persona
- `showPlatformDropdown`: Controls platform dropdown visibility
- `selectedPlatformOption`: Selected platform option from dropdown
- `showSolutionsDropdown`: Controls solutions dropdown visibility  
- `selectedSolutionOption`: Selected solution from dropdown
- `dropdownTimeout`: Manages dropdown hover delay timing

### Navigation Handlers
Interactive dropdown functionality with hover effects:
- `handlePlatformMouseEnter()`: Shows platform dropdown on hover
- `handlePlatformMouseLeave()`: Hides platform dropdown with 300ms delay
- Similar handlers for solutions dropdown to prevent flickering

## Page Sections

### 1. Header/Navigation
- **Logo**: VadisMedia branding (light/dark variants)
- **Navigation Menu**: Platform, Solutions, Resources, About
- **CTA Buttons**: "Get Started" and "Sign In"
- **Responsive**: Mobile hamburger menu for smaller screens

### 2. Hero Section
- **Headline**: "Where Great Ideas Meet Perfect Execution"
- **Subheadline**: Platform description and value proposition
- **Role Selection**: Interactive cards for different user personas:
  - Production Companies
  - Brands & Agencies  
  - Financiers
  - Individual Creators
- **Primary CTA**: "Get Started" button
- **Trust Indicators**: Company logos (Netflix, Apple, Amazon, etc.)

### 3. Power Features Section
- **Background**: Modern gradient with grain texture
- **Content**: AI-powered capabilities showcase
- **Layout**: Responsive grid for feature highlights

### 4. Call to Action Section
- **Headline**: "Ready to join the future of media and entertainment?"
- **Description**: Updated to mention target audiences and VadisAI branding
- **Buttons**: Primary "Get Started" and secondary "Contact sales"
- **Clean Design**: Removed floating decorative elements for cleaner appearance

### 5. Footer
- **Company Info**: 
  - Logo (h-16 size, object-contain to prevent stretching)
  - Address formatted on multiple lines:
    - Gartenstrasse 6,
    - 6300 Zug,
    - Switzerland
- **Navigation Columns**:
  - **Platform**: Create, Analyze, Brand, Fund
  - **Company**: About, Careers, Press, Contact
  - **Resources**: Technical Support, Sales, FAQ
- **Legal**: Copyright notice "© 2025 Vadis Media AG. All rights reserved."
- **Policies**: Privacy Policy, Terms of Service, Cookie Policy

## Design System

### Color Scheme
- **Primary**: Blue to purple gradient (`from-blue-500 via-purple-600 to-pink-600`)
- **Background**: White with dark footer (`bg-gray-900`)
- **Text**: Gray scale hierarchy (`text-gray-900`, `text-gray-600`, `text-gray-400`)

### Typography
- **Headlines**: Bold, large font sizes with responsive scaling
- **Body Text**: Relaxed leading, readable sizing
- **Footer**: Smaller text with proper hierarchy

### Interactive Elements
- **Hover Effects**: Smooth transitions (200-500ms duration)
- **Animations**: Fade-in, slide-in effects with staggered delays
- **Buttons**: Gradient backgrounds with scale transforms on hover

### Responsive Design
- **Grid System**: CSS Grid with responsive breakpoints
- **Mobile-First**: Collapsible navigation, stacked layouts
- **Breakpoints**: `sm:`, `md:`, `lg:` Tailwind classes

## Content Strategy

### Messaging
- **Primary Value Prop**: AI-powered collaboration for media production
- **Target Audience**: Clearly defined user personas
- **Call to Action**: Focus on getting started and sales contact

### Brand Elements
- **Company Name**: VadisAI (updated from VadisMedia)
- **Positioning**: "Empowers the future of film and media"
- **Trust Signals**: Industry leader logos and security badges

## Technical Implementation

### Performance Optimizations
- **Image Assets**: Optimized logo files with proper sizing
- **CSS**: Tailwind classes for minimal bundle size
- **Animations**: CSS-based transforms, no JavaScript animation libraries

### Accessibility
- **Alt Text**: Proper image descriptions
- **Keyboard Navigation**: Focus states on interactive elements
- **Color Contrast**: Adequate contrast ratios for text

### SEO Considerations
- **Meta Tags**: Proper title and description elements
- **Semantic HTML**: Proper heading hierarchy
- **Content Structure**: Logical flow for search engines

## Maintenance Notes

### Recent Updates
- Removed floating decorative elements for cleaner design
- Updated branding from VadisMedia to VadisAI
- Improved footer alignment and logo sizing
- Enhanced address formatting with multi-line display
- Updated navigation menu items to reflect current platform features

### Future Considerations
- Consider adding testimonials section
- Potential for A/B testing different CTA placements
- Integration with authentication system for user sign-up flow
- Analytics tracking for conversion optimization