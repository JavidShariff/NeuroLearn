import { motion } from "framer-motion";
import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-auto border-t border-border/50 glass"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">NeuroLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered collaborative learning platform for students & professionals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link></li>
              <li><Link to="/rooms" className="hover:text-primary transition">Study Rooms</Link></li>
              <li><Link to="/quiz" className="hover:text-primary transition">AI Quiz</Link></li>
              <li><Link to="/forum" className="hover:text-primary transition">Forum</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary transition">Blog</Link></li>
              <li><Link to="#" className="hover:text-primary transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 NeuroLearn. All rights reserved. Built with ❤️ for learners everywhere.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
