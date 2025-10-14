import { motion } from "framer-motion";
import { Brain, Target, Users, Zap, Heart, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Democratizing education through AI-powered collaborative learning",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a supportive network of learners helping each other grow",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging cutting-edge AI to enhance the learning experience",
    },
  ];

  const team = [
    { name: "Sarah Chen", role: "Founder & CEO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "Mike Johnson", role: "CTO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    { name: "Emma Davis", role: "Head of Product", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    { name: "Alex Wong", role: "Lead Engineer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card mb-6">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-5xl font-bold mb-6 gradient-text">About NeuroLearn</h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to revolutionize education by combining AI technology 
                with the power of collaborative learning.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 gradient-text">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  NeuroLearn was born from a simple observation: traditional learning methods 
                  weren't keeping pace with how modern students actually learn. We saw students 
                  struggling to stay engaged, spending hours creating study materials manually, 
                  and lacking the collaborative environments that make learning stick.
                </p>
                <p>
                  In 2024, we set out to change that. By combining advanced AI technology with 
                  proven collaborative learning principles, we created a platform that adapts 
                  to each learner's needs while fostering a supportive community.
                </p>
                <p>
                  Today, NeuroLearn serves thousands of students and professionals worldwide, 
                  helping them learn faster, retain more, and achieve their educational goals 
                  together.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent blur-3xl opacity-20" />
              <Card className="glass-card p-8 relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">10,000+</h3>
                      <p className="text-sm text-muted-foreground">Active Learners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10">
                      <Brain className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">50,000+</h3>
                      <p className="text-sm text-muted-foreground">AI Quizzes Generated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">1,000+</h3>
                      <p className="text-sm text-muted-foreground">Study Rooms Created</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-b from-background to-background/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 gradient-text">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card p-8 text-center hover-lift h-full">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 gradient-text">Meet the Team</h2>
            <p className="text-xl text-muted-foreground">
              Passionate educators and technologists working to transform learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 text-center hover-lift">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-bold mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-20 bg-gradient-to-b from-background/50 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl glass-card mb-6">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-4 gradient-text">Built with Modern Tech</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                NeuroLearn is powered by cutting-edge technologies to deliver a fast, 
                reliable, and intelligent learning experience.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {["React", "TypeScript", "Tailwind CSS", "Framer Motion", "AI/ML", "WebRTC"].map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card px-6 py-3 hover-lift">
                      <span className="font-medium">{tech}</span>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
