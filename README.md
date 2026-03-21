# Jarurat Care - Patient Records Dashboard

A modern, responsive patient records management system built with React, TypeScript, and Tailwind CSS. This application provides healthcare professionals with an intuitive interface to manage patient data, medical history, and appointments efficiently.

![Jarurat Care Dashboard](https://img.shields.io/badge/Healthcare-Patient_Records-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Included-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss)

## 🏥 Features

### Core Functionality
- **Patient Management**: Comprehensive patient record management with detailed profiles
- **Search & Filter**: Advanced search functionality to quickly locate patient records
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices
- **Real-time Updates**: Live patient data management with instant updates

### Patient Information
- Personal details (name, age, contact information)
- Medical history and records
- Emergency contact information
- Blood type and allergies
- Visit history and appointments

### User Experience
- **Professional Design**: Clean, medical-focused interface design
- **Loading States**: Elegant loading animations and error handling
- **Form Validation**: Comprehensive input validation for data integrity
- **Modal Interactions**: Smooth modal dialogs for detailed views and forms
- **Toast Notifications**: User-friendly notifications for actions and updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jarurat-care-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the application

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript rules

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── Navigation.tsx   # Main navigation component
│   ├── PatientCard.tsx  # Patient card display component
│   ├── PatientModal.tsx # Patient details modal
│   └── AddPatientForm.tsx # Add patient form component
├── pages/               # Application pages
│   ├── Home.tsx         # Landing page
│   ├── Patients.tsx     # Main patients dashboard
│   ├── About.tsx        # About page
│   └── NotFound.tsx     # 404 error page
├── types/               # TypeScript type definitions
│   └── patient.ts       # Patient interface definitions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── App.tsx              # Main application component
```

### Design System
The application uses a custom design system with healthcare-focused colors and themes:
- **Primary Colors**: Medical blue (#2563eb)
- **Accent Colors**: Medical green (#16a34a)
- **Typography**: Clean, readable fonts optimized for medical applications
- **Components**: Consistent component variants across the application

## 📱 Screenshots

### Landing Page
Professional landing page with clear navigation and call-to-action buttons for accessing patient records and adding new patients.

### Patients Dashboard
- Grid layout displaying patient cards with essential information
- Advanced search and filter capabilities
- Statistics cards showing patient metrics
- Quick access to patient actions

### Patient Details Modal
- Comprehensive patient information display
- Medical history and emergency contacts
- Professional layout with clear information hierarchy

### Add Patient Form
- Comprehensive form for adding new patients
- Form validation and error handling
- Medical-specific fields (blood type, medical history)

## 🔧 Configuration

### Environment Setup
The application is configured to work with:
- **Development Server**: Vite dev server on port 8080
- **Path Aliases**: `@/` alias for the `src/` directory
- **TypeScript**: Strict mode enabled for better type safety

### Data Source
- **Public API**: Patient list is fetched from `https://jsonplaceholder.typicode.com/users` at runtime and mapped to the app's `Patient` type (name, email, phone -> contact, address, etc.).
- **Fallback**: If the public API is unavailable, the app gracefully falls back to bundled mock patients so the UI remains fully functional.

### Screenshots
- Add screenshots by placing images in the `public/` folder and referencing them in this README, e.g. `![Patients](public/patients.png)`.
  - Recommended: Home, Patients Grid, Patient Modal, Add Patient Form, Loading/Error states.

### Customization
- **Colors**: Modify color variables in `src/index.css`
- **Components**: Customize UI components in `src/components/ui/`
- **Styling**: Extend Tailwind configuration in `tailwind.config.ts`

## 🚀 Deployment

The application can be deployed to various platforms:

### Other Platforms
- **Vercel**: Connect your GitHub repository to Vercel
- **Netlify**: Deploy directly from your Git repository
- **AWS S3**: Upload build files to S3 bucket with static hosting

## 🔒 Security Considerations

- Patient data is currently stored in local state (development only)
- For production use, implement proper backend API with encryption
- Consider HIPAA compliance requirements for healthcare applications
- Implement proper authentication and authorization systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@jaruratcare.com
- **Documentation**: Visit our comprehensive documentation
- **Issues**: Report bugs and request features in the GitHub Issues section

## 🔮 Future Enhancements

- **Backend Integration**: Connect to a proper database and API
- **Authentication**: User login and role-based access control
- **Appointment Scheduling**: Integrated calendar and appointment management
- **Medical Records**: Enhanced medical history with file uploads
- **Reports**: Generate patient reports and medical summaries
- **Integration**: Connect with existing hospital management systems

---

**Jarurat Care** - Empowering healthcare professionals with better patient management tools.