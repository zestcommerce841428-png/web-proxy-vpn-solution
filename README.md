# 🌐 Web Proxy Application

A modern, full-featured web proxy application built with **Next.js 16.2** and **Material UI** to help you bypass blocked websites with a beautiful, intuitive user interface.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![React](https://img.shields.io/badge/React-19-blue)
![Material UI](https://img.shields.io/badge/Material--UI-6.3-blue)
![License](https://img.shields.io/badge/license-ISC-green)

## ✨ Features

- 🚀 **Fast & Secure** - High-speed proxy server with encrypted connections
- 🎨 **Modern UI** - Beautiful dark theme with Material UI components
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔒 **Anonymous Browsing** - Browse websites without exposing your identity
- 📊 **Server Status Monitor** - Real-time proxy server connection status
- 📜 **Browsing History** - Keep track of accessed websites
- ⚙️ **Customizable Settings** - Configure auto-redirect, history saving, and more
- 🎯 **User-Friendly** - Simple URL input with one-click access

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.2** - React framework with App Router
- **React 19** - Latest React version
- **Material UI 6.3** - Modern component library
- **Emotion** - CSS-in-JS styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **http-proxy-middleware** - Proxy middleware for Node.js
- **Axios** - HTTP client for fetching content
- **CORS** - Cross-Origin Resource Sharing support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

## 🚀 Installation

1. **Navigate to the project directory:**
   ```bash
   cd web-proxy-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 💻 Usage

You need to run **two servers** simultaneously:

### 1. Start the Proxy Server (Backend)

Open a terminal and run:
```bash
npm run proxy
```

This will start the proxy server on `http://localhost:3001`

You should see:
```
🚀 Proxy server running on http://localhost:3001
📡 Use: http://localhost:3001/proxy?url=YOUR_TARGET_URL
```

### 2. Start the Next.js Application (Frontend)

Open a **new terminal** and run:
```bash
npm run dev
```

This will start the Next.js development server on `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 How to Use

1. **Check Server Status**: The app will automatically check if the proxy server is online (green chip = online, red chip = offline)

2. **Enter URL**: Type the website URL you want to access (e.g., `example.com` or `https://example.com`)

3. **Access Website**: Click the "Access" button to connect through the proxy

4. **Settings**: 
   - Toggle "Auto-open in new tab" to automatically open proxied websites
   - Enable/disable browsing history
   - Configure notifications

5. **History**: View and manage your recently accessed websites

## 🔧 Configuration

### Proxy Server Port

To change the proxy server port, edit `server/proxy-server.js`:

```javascript
const PORT = 3001; // Change this to your desired port
```

### Next.js Port

To change the Next.js port, modify the dev script in `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3000"
}
```

## 🏗️ Project Structure

```
web-proxy-app/
├── server/
│   └── proxy-server.js       # Express proxy server
├── src/
│   ├── app/
│   │   ├── layout.js         # Root layout with Theme Provider
│   │   ├── page.js           # Main homepage component
│   │   └── globals.css       # Global styles
│   └── theme.js              # Material UI theme configuration
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Documentation
```

## 🎨 Features Breakdown

### Server Status Indicator
- Real-time monitoring of proxy server connection
- Visual feedback with color-coded chips
- Automatic status checking on page load

### Proxy Access
- Support for HTTP and HTTPS websites
- Automatic URL validation and formatting
- Error handling with user-friendly messages

### Settings Panel
- **Auto-redirect**: Automatically open websites in new tabs
- **Save History**: Toggle browsing history persistence
- **Show Notifications**: Enable/disable notification alerts

### Browsing History
- Stores last 10 accessed websites
- Timestamps for each entry
- Quick access buttons to re-open websites
- Delete individual entries or clear all history

## 🔒 Security Considerations

⚠️ **Important Security Notes:**

1. This proxy is intended for **development and personal use**
2. The proxy server runs locally and is NOT suitable for production without proper security measures
3. Consider the following for production:
   - Add authentication and authorization
   - Implement rate limiting
   - Use HTTPS/SSL certificates
   - Add logging and monitoring
   - Configure firewall rules
   - Implement IP whitelisting

## 🐛 Troubleshooting

### Proxy Server Offline

**Problem**: The status shows "Proxy Server Offline"

**Solutions**:
- Make sure you've started the proxy server with `npm run proxy`
- Check if port 3001 is already in use
- Verify Node.js is installed correctly

### Cannot Access Websites

**Problem**: Websites fail to load through the proxy

**Solutions**:
- Ensure the URL is correct and includes the protocol (http/https)
- Check if the target website is actually available
- Some websites may block proxy access
- Check your internet connection

### Material UI Not Loading

**Problem**: Styles are not appearing correctly

**Solutions**:
- Clear your browser cache
- Restart the Next.js development server
- Run `npm install` again to ensure all dependencies are installed

## 📦 Building for Production

To create a production build:

```bash
npm run build
npm start
```

Don't forget to also run the proxy server:
```bash
npm run proxy
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Material UI for the beautiful component library
- Express and http-proxy-middleware for proxy functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the project issues on GitHub
3. Create a new issue with detailed information

## 🎯 Roadmap

Future enhancements planned:

- [ ] Add support for SOCKS proxy
- [ ] Implement VPN functionality
- [ ] Add multiple proxy server locations
- [ ] Include website screenshot preview
- [ ] Add browser extension
- [ ] Implement caching for faster access
- [ ] Add bookmark management
- [ ] Include download manager
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

**Made with ❤️ using Next.js and Material UI**

**Note**: Always respect website terms of service and local regulations when using proxy services.
