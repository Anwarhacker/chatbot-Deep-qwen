# Advanced AI Chatbot Application

A modern, responsive chatbot web application built with Next.js and TailwindCSS that integrates with OpenRouter API to provide AI-powered conversations with multiple language models.

![Chatbot Interface](https://via.placeholder.com/800x400/1f2937/ffffff?text=AI+Chatbot+Interface)

## 🚀 Features

### Core Functionality
- **Real-time AI Chat**: Engage in conversations with multiple AI models
- **Streaming Responses**: Real-time message streaming with typing indicators
- **Multi-Chat Management**: Create, manage, and switch between multiple chat sessions
- **Message Actions**: Copy, like/dislike, and regenerate responses
- **Chat Export**: Export conversations as JSON files
- **Conversation History**: Persistent chat history with context preservation

### User Interface
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **Collapsible Sidebar**: Mobile-friendly navigation with slide-out sidebar
- **Modern UI Components**: Built with shadcn/ui component library
- **Touch-Friendly**: Optimized for touch interactions on mobile devices

### AI Integration
- **Multiple AI Models**: Support for various OpenRouter models
- **Model Selection**: Switch between different AI models mid-conversation
- **Context Awareness**: Maintains full conversation context
- **Error Handling**: Graceful error handling with user feedback

## 🛠️ Technologies Used

### Frontend Framework
- **Next.js 14+**: React framework with App Router
- **React 18+**: Modern React with hooks and server components
- **TypeScript**: Type-safe development

### Styling & UI
- **TailwindCSS v4**: Utility-first CSS framework
- **shadcn/ui**: High-quality React component library
- **Lucide React**: Beautiful icon library
- **CSS Grid & Flexbox**: Modern layout techniques

### API Integration
- **OpenRouter API**: AI model access and management
- **Server-Side API Routes**: Secure API key handling
- **Streaming API**: Real-time response streaming
- **Fetch API**: Modern HTTP client

### State Management
- **React Hooks**: useState, useEffect, useRef for local state
- **Local Storage**: Persistent chat history (can be extended)
- **Context Management**: Conversation state management

## 📁 Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # OpenRouter API integration
│   ├── globals.css               # Global styles and Tailwind config
│   ├── layout.tsx               # Root layout with theme provider
│   └── page.tsx                 # Main chatbot interface
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── message-actions.tsx      # Message interaction buttons
│   ├── model-selector.tsx       # AI model selection dropdown
│   └── theme-provider.tsx       # Dark/light mode provider
├── hooks/
│   ├── use-mobile.tsx          # Mobile device detection
│   └── use-toast.ts            # Toast notification system
├── lib/
│   └── utils.ts                # Utility functions
└── README.md                   # Project documentation
\`\`\`

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- OpenRouter API key

### Environment Variables
Create a `.env.local` file in the root directory:

\`\`\`env
OPENROUTER_API_KEY=your_openrouter_api_key_here
\`\`\`

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd chatbot-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your OpenRouter API key

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Starting a Conversation
1. Click "New Chat" to create a new conversation
2. Type your message in the input field
3. Press Enter or click the Send button
4. Watch as the AI responds in real-time

### Managing Chats
- **Create**: Click "New Chat" button in the sidebar
- **Switch**: Click on any chat in the sidebar to switch
- **Delete**: Hover over a chat and click the trash icon
- **Export**: Click the "Export" button to download chat as JSON

### Customizing Experience
- **Change Model**: Click Settings gear icon and select a different AI model
- **Toggle Theme**: Click the sun/moon icon to switch between light/dark mode
- **Mobile Navigation**: Use the hamburger menu on mobile devices

### Message Interactions
- **Copy**: Click the copy icon to copy any message
- **Rate**: Use thumbs up/down to rate AI responses
- **Regenerate**: Click the refresh icon to regenerate the last AI response

## 🔌 API Integration

### OpenRouter Integration
The application integrates with OpenRouter API through a secure server-side route:

\`\`\`typescript
// app/api/chat/route.ts
export async function POST(request: NextRequest) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
      "X-Title": "Advanced Chatbot App",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: conversationHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
}
\`\`\`

### Supported Models
- **DeepSeek R1**: Fast and efficient free model
- **Llama 3.2 3B**: Balanced performance
- **Phi-3 Mini**: Compact and quick responses
- **Gemma 2 9B**: Google's latest model

## 🎨 Design System

### Color Palette
- **Primary**: Blue-based theme colors
- **Secondary**: Gray-based neutral colors
- **Success**: Green for positive actions
- **Destructive**: Red for negative actions

### Typography
- **Font Family**: System fonts (Geist Sans, Geist Mono)
- **Sizes**: Responsive text sizing (text-sm to text-xl)
- **Weights**: Regular (400) to Semibold (600)

### Layout Principles
- **Mobile-First**: Responsive design starting from mobile
- **Flexbox**: Primary layout method for components
- **Grid**: Used for complex 2D layouts
- **Spacing**: Consistent spacing scale (0.5rem to 4rem)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (sm)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: > 1024px (lg)

### Mobile Optimizations
- Collapsible sidebar with overlay
- Touch-friendly button sizes (minimum 44px)
- Optimized text sizes and spacing
- Swipe gestures for navigation
- Always-visible action buttons

### Desktop Features
- Persistent sidebar
- Hover states for interactions
- Keyboard shortcuts (Enter to send)
- Larger content areas

## 🔒 Security Features

### API Key Protection
- Server-side API calls only
- Environment variable storage
- No client-side exposure of sensitive data

### Input Validation
- Message content sanitization
- Request rate limiting (can be implemented)
- Error boundary protection

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
\`\`\`env
OPENROUTER_API_KEY=your_production_api_key
VERCEL_URL=your_domain.vercel.app
\`\`\`

## 🔄 Future Enhancements

### Planned Features
- **User Authentication**: Login/signup functionality
- **Chat Persistence**: Database storage for chat history
- **File Uploads**: Support for image and document uploads
- **Voice Input**: Speech-to-text integration
- **Custom Models**: Support for custom AI models
- **Team Collaboration**: Shared chat workspaces

### Technical Improvements
- **Caching**: Redis caching for improved performance
- **Rate Limiting**: API request throttling
- **Analytics**: Usage tracking and insights
- **PWA**: Progressive Web App capabilities
- **Offline Mode**: Basic offline functionality

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**
- Verify the API key is correctly set in environment variables
- Check OpenRouter account credits and permissions

**Streaming Not Working**
- Ensure browser supports Server-Sent Events
- Check network connectivity and firewall settings

**Mobile Layout Issues**
- Clear browser cache and reload
- Ensure viewport meta tag is present

**Performance Issues**
- Check for memory leaks in long conversations
- Consider implementing message pagination

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review OpenRouter API documentation

---

**Built with ❤️ using Next.js, TailwindCSS, and OpenRouter API**
