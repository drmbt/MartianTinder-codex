# MartianTinder - Sprint Board

**Project**: MartianTinder MVP  
**Current Sprint**: Sprint 5 (Mobile UX Polish & Advanced Features)  
**Last Updated**: Image System Refactor - Gallery Aspect Ratio & Mobile UX Polish Needed

---

## ✅ Recently Completed (Current Session)

- [x] **Image Upload System Refactor**
  - [x] Eliminated duplicate thumbnail generation (now single 2048px WebP only)
  - [x] Replaced old ImageGallery with NextImageGallery using Next.js Image
  - [x] Fixed hydration mismatch errors in proposal forms
  - [x] Implemented controlled image upload component architecture
  - [x] Added always-visible remove buttons for mobile UX
  - [x] Created full-screen image viewer with click-to-expand
  - [x] Converted all image displays to use Next.js Image optimization
  - [x] Fixed state management conflicts between parent/child components

## 🎯 Current Priority Issues

- [ ] **Image Gallery Aspect Ratio Fixes**
  - [ ] Fix main gallery carousel to display 4:5 aspect ratio (currently wider)
  - [ ] Ensure thumbnails remain 1:1 square with center cropping
  - [ ] Test gallery navigation and touch interactions on mobile
  - [ ] Verify Next.js Image optimization working correctly

- [ ] **Mobile Feed Navigation Issues**
  - [ ] Fix proposal navigation feed not being navigable on mobile
  - [ ] Implement proper touch/swipe gestures for feed cards
  - [ ] Optimize mobile touch targets and interaction zones
  - [ ] Test feed scrolling and card interactions on various mobile devices

- [ ] **Proposal Creation Form UX Refactor** (Needs Definition)
  - [ ] Define specific UI improvements needed for proposal creation
  - [ ] Identify mobile UX pain points in current form
  - [ ] Plan form field organization and validation UX
  - [ ] Design mobile-first form layout and interactions
  - [ ] Consider multi-step form approach for complex proposals

---

## 🔄 Sprint 5 Continuation

- [ ] **Enhanced Calendar Integration**
  - [ ] Implement Google Calendar channel creation strategy
  - [ ] Build dual calendar system (channel + personal)
  - [ ] Complete Event model and reification logic
  - [ ] Integrate ical-generator for ICS file generation
  - [ ] Create `/api/ics/event/:id.ics` endpoint
  - [ ] Create `/api/ics/user/:id.ics` user feed endpoint
  - [ ] Implement "Add to Google Calendar" template links
  - [ ] Build automatic event addition to personal calendars
- [ ] **Event Image Support**
  - [ ] Add event image support to reification flow

- [ ] **Mobile-First UI/UX Enhancement**
  - [ ] Polish 5-tab navigation with smooth transitions
  - [ ] Implement swipe gestures for tab switching
  - [ ] Optimize touch interactions and button sizing
  - [ ] Add loading states and skeleton screens
  - [ ] Implement pull-to-refresh functionality

- [ ] **Enhanced Discovery & Filtering**
  - [ ] Advanced search functionality across all tabs
  - [ ] Keyword search in proposals and user content
  - [ ] Smart filtering with multiple criteria combinations
  - [ ] Saved filter presets for quick access
  - [ ] Real-time search suggestions and autocomplete

- [ ] **Media & Content Features**
  - [x] ~~Add basic image crop/fit functionality~~ (Completed - using Next.js Image)
  - [ ] External chat link integration and display
  - [ ] Rich text formatting for proposal descriptions
  - [ ] Emoji reactions and status indicators

- [ ] **Performance & Optimization**
  - [ ] Implement virtual scrolling for large lists
  - [x] ~~Add image lazy loading and optimization~~ (Completed - Next.js Image handles this)
  - [ ] Optimize API response caching
  - [ ] Performance monitoring and error tracking
  - [ ] Bundle size optimization

---

## Sprint 6: Testing & Production Readiness

### ⏳ Pending

- [ ] **End-to-End Testing**
  - [ ] Create Playwright test suite for critical user flows
  - [ ] Test complete user journey from signup to event participation
  - [ ] Cross-browser and device compatibility testing
  - [ ] Performance testing under load
  - [ ] Security testing and vulnerability assessment

- [ ] **Production Deployment**
  - [ ] Environment configuration for production
  - [ ] Database migration from SQLite to PostgreSQL
  - [ ] CI/CD pipeline setup
  - [ ] Monitoring and logging infrastructure
  - [ ] Backup and recovery procedures

- [ ] **Documentation & Maintenance**
  - [ ] Complete API documentation
  - [ ] User guide and onboarding documentation
  - [ ] Admin and deployment guides
  - [ ] Code documentation and inline comments
  - [ ] Maintenance and update procedures

---

## Future Enhancements (Post-MVP)

### Advanced Calendar Integration

- [ ] Real Google Calendar OAuth + API write integration
- [ ] Automatic calendar conflict detection and resolution
- [ ] Calendly-style availability collection and slot voting
- [ ] Integration with other calendar services (Outlook, Apple Calendar)
- [ ] Advanced scheduling with time zone support

### Community & Governance Features

- [ ] Advanced moderation tools and content policies
- [ ] Reputation systems and user verification badges
- [ ] Cross-channel discovery with privacy controls
- [ ] Community analytics and health dashboards
- [ ] Advanced governance tools (voting, delegation, polls)

### Mobile & PWA Features

- [ ] PWA installation with offline caching
- [ ] Push notifications for threshold met, event reminders
- [ ] Voice-to-text proposal creation
- [ ] Camera integration for image capture
- [ ] Biometric authentication support

### Infrastructure & Scale

- [ ] Multi-tenant architecture for organizations
- [ ] Background job processing for notifications
- [ ] Real-time updates via WebSockets
- [ ] Cloud storage integration for images and files
- [ ] Advanced security and audit logging

### AI & Automation

- [ ] AI-generated proposal images and content suggestions
- [ ] Smart proposal categorization and tagging
- [ ] Automated moderation and content filtering
- [ ] Intelligent notification timing
- [ ] Predictive analytics for proposal success

---

## Technical Debt & Improvements

### Code Quality

- [ ] Comprehensive test coverage beyond happy path scenarios
- [ ] Performance monitoring and optimization implementation
- [ ] Security audit and hardening procedures
- [ ] Code documentation and API documentation
- [ ] TypeScript strict mode compliance across all files

### User Experience

- [ ] Advanced mobile optimizations and touch interactions
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Internationalization support (i18n)
- [ ] Dark mode implementation
- [ ] High contrast and large text accessibility options

### Infrastructure

- [ ] Database query optimization and indexing
- [ ] Caching strategy implementation (Redis)
- [ ] CDN integration for static assets
- [ ] Error tracking and monitoring (Sentry)
- [ ] Performance analytics and user behavior tracking

---

## Configuration & Deployment

### Environment Setup

- [ ] Development environment documentation and setup scripts
- [ ] Production deployment guide with Docker containerization
- [ ] Environment variable documentation and validation
- [ ] Database migration and backup procedures
- [ ] SSL certificate and domain configuration

### Monitoring & Maintenance

- [ ] Error tracking and monitoring setup (Sentry, LogRocket)
- [ ] Performance monitoring and alerting (Vercel Analytics)
- [ ] Backup and recovery procedures testing
- [ ] Update and maintenance workflow documentation
- [ ] Security scanning and vulnerability monitoring
