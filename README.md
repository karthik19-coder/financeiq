# FinanceIQ 🚀

FinanceIQ is a premium, modern financial management dashboard designed to empower users with deep insights into their spending habits and financial health. Built with **React 19**, **Vite**, and **Tailwind CSS**, it offers a seamless, high-performance experience with a stunning glassmorphic aesthetic.

![FinanceIQ Preview](https://via.placeholder.com/1200x600/0f172a/ffffff?text=FinanceIQ+Dashboard+Preview)

## ✨ Features

- 📊 **Smart Dashboard**: A bird's-eye view of your total balance, income, and expenses with real-time updates.
- 💸 **Transaction Management**: Effortlessly track every penny. Categorize, filter, and search through your financial history.
- 🎯 **Budgeting Tools**: Set monthly limits for different categories and stay on top of your financial goals.
- 📈 **Visual Analytics**: Interactive charts and graphs powered by **Recharts** to visualize spending trends and patterns.
- 🎨 **Premium UI/UX**: A state-of-the-art interface featuring:
  - Glassmorphism effects
  - Smooth micro-animations using **Framer Motion**
  - Fully responsive design for all devices
  - Dark-mode optimized color palette
- 🔐 **Firebase Integration**: Secure data persistence and real-time synchronization.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Yup](https://github.com/jquense/yup)
- **Backend**: [Firebase](https://firebase.google.com/)
- **Icons**: React Icons (Lucide, Material Design)
- **Toasts**: React Toastify

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI components (Buttons, Modals, Cards)
├── context/         # Global state management using Context API
├── hooks/           # Custom React hooks for business logic
├── pages/           # Main application screens
│   ├── Dashboard/   # Financial overview & quick stats
│   ├── Transactions/# Full transaction history & management
│   ├── Budget/      # Budget setting & tracking
│   └── Analytics/   # Deep-dive charts & reports
├── services/        # Firebase & API service integrations
└── utils/           # Helper functions & formatting constants
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/finance-app.git
   cd finance-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Deployment

The project is configured for easy deployment on **Vercel** or **Netlify**.

-   **Vercel**: Simply import the repository and it will automatically detect the Vite setup.
-   **Netlify**: Ensure the build command is `npm run build` and the publish directory is `dist`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Karthik](https://github.com/karthik19-coder)
