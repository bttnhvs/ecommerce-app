# 🛒 Ecommerce App

A modern, responsive ecommerce application built with Angular 19 and Bootstrap 5. This application provides a seamless shopping experience with product browsing, cart management, and real-time inventory tracking.

## ✨ Features

- **Product Catalog**: Browse and view products with detailed information
- **Shopping Cart**: Add, update, and remove items from your cart
- **Real-time Inventory**: Live stock tracking with minimum order requirements
- **Responsive Design**: Mobile-first design using Bootstrap 5
- **State Management**: Reactive state management with RxJS BehaviorSubject
- **RESTful API Integration**: Fetches products from external API
- **TypeScript**: Full type safety and better development experience

## 🚀 Live Demo

[Coming Soon]

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Angular CLI** (version 19.2.2 or higher)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-app.git
   cd ecommerce-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/` to view the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── models/           # TypeScript interfaces
│   │   ├── product.ts    # Product interface
│   │   └── cart.ts       # Cart item interface
│   ├── pages/            # Main application pages
│   │   ├── products/     # Products listing page
│   │   └── cart/         # Shopping cart page
│   ├── service/          # Business logic and API calls
│   │   └── product.service.ts
│   ├── app.routes.ts     # Application routing
│   ├── app.config.ts     # Application configuration
│   └── app.ts            # Main application component
├── index.html            # Main HTML file
└── styles.scss           # Global styles
```

## 🎯 Key Components

### Product Service
The `ProductService` manages the application state and handles:
- Product fetching from API
- Cart operations (add, update, remove, clear)
- Real-time inventory management
- State synchronization across components

### Models
- **Product**: Defines product structure with id, name, image, availability, and pricing
- **CartItem**: Represents items in the shopping cart with product and quantity

### Pages
- **Products Page**: Displays product catalog with add-to-cart functionality
- **Cart Page**: Shows cart items with quantity management and checkout options

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Starts the development server |
| `npm run build` | Builds the project for production |
| `npm run watch` | Builds the project and watches for changes |
| `npm test` | Runs unit tests with Karma |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The application uses:
- **Jasmine** for unit testing
- **Karma** as the test runner
- **Angular Testing Utilities** for component testing

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, optimized for performance and speed.

## 🌐 API Integration

The application integrates with a RESTful API to fetch product data:
- **Base URL**: `https://63c10327716562671870f959.mockapi.io/products`
- **Method**: GET
- **Response**: Array of Product objects

## 🎨 Styling

The application uses:
- **Bootstrap 5.3.7** for responsive design and UI components
- **SCSS** for custom styling
- **Mobile-first** approach for optimal user experience

## 🔄 State Management

The application implements a reactive state management pattern using:
- **RxJS BehaviorSubject** for state storage
- **Observables** for reactive data flow
- **Immutable state updates** for predictable state changes

## 🚀 Deployment

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Netlify

### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Angular and deploy

### GitHub Pages
1. Build the project: `npm run build`
2. Push the `dist/` folder to the `gh-pages` branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - The web framework used
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [RxJS](https://rxjs.dev/) - Reactive programming library
- [TypeScript](https://www.typescriptlang.org/) - Programming language

## 📞 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/yourusername/ecommerce-app/issues)
- Contact: your.email@example.com

---

⭐ If you found this project helpful, please give it a star!
