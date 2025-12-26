import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    question: "Qu'est-ce que CareerNetwork ?",
    answer: "CareerNetwork est une plateforme intelligente de mise en relation entre candidats et entreprises. Nous utilisons l'intelligence artificielle pour vous proposer les offres d'emploi les plus pertinentes selon votre profil, vos compétences et vos aspirations.",
    keywords: ["qu'est-ce", "c'est quoi", "qu'est", "careernetwork", "plateforme", "service"]
  },
  {
    question: "Comment fonctionne CareerNetwork ?",
    answer: "C'est très simple ! 1) Créez votre profil avec vos compétences et expériences. 2) Notre IA analyse votre profil et vous propose des offres personnalisées. 3) Postulez directement aux offres qui vous intéressent. Tout se fait en quelques clics !",
    keywords: ["comment", "fonctionne", "marche", "utiliser", "processus", "étapes"]
  },
  {
    question: "Est-ce gratuit ?",
    answer: "Oui, CareerNetwork est entièrement gratuit pour les candidats ! Vous pouvez créer votre profil, recevoir des recommandations personnalisées et postuler à autant d'offres que vous le souhaitez sans aucun frais.",
    keywords: ["gratuit", "prix", "coût", "tarif", "payant", "gratuite"]
  },
  {
    question: "Comment créer mon profil ?",
    answer: "Cliquez sur 'Inscription' en haut de la page, remplissez vos informations de base, puis complétez votre profil avec vos compétences, formations, expériences professionnelles et autres informations pertinentes. Plus votre profil est complet, meilleures seront les recommandations !",
    keywords: ["créer", "profil", "inscription", "s'inscrire", "compte", "enregistrer"]
  },
  {
    question: "Comment fonctionne l'IA de recommandation ?",
    answer: "Notre intelligence artificielle analyse votre profil (compétences, expériences, formations) et le compare avec les offres d'emploi disponibles. Elle identifie les meilleures correspondances en fonction de plusieurs critères : compétences requises, niveau d'expérience, secteur d'activité, et bien plus encore.",
    keywords: ["ia", "intelligence artificielle", "recommandation", "algorithme", "matching", "suggestion"]
  },
  {
    question: "Puis-je postuler à plusieurs offres ?",
    answer: "Absolument ! Vous pouvez postuler à autant d'offres que vous le souhaitez. Chaque candidature est indépendante et vous pouvez suivre le statut de toutes vos candidatures depuis votre tableau de bord.",
    keywords: ["postuler", "candidature", "plusieurs", "combien", "limite"]
  },
  {
    question: "Quels types d'emplois sont disponibles ?",
    answer: "CareerNetwork propose une large gamme d'offres d'emploi : temps plein, temps partiel, contrats, stages, dans de nombreux secteurs d'activité. Que vous soyez débutant ou expérimenté, vous trouverez des opportunités adaptées à votre profil.",
    keywords: ["types", "emplois", "offres", "postes", "secteurs", "domaines"]
  },
  {
    question: "Comment les recruteurs utilisent-ils la plateforme ?",
    answer: "Les recruteurs peuvent publier leurs offres d'emploi sur CareerNetwork. Une fois publiées, les offres sont soumises à validation, puis notre IA les propose aux candidats les plus pertinents. Les recruteurs reçoivent les candidatures et peuvent gérer tout le processus de recrutement depuis leur tableau de bord.",
    keywords: ["recruteur", "entreprise", "employeur", "publier", "offre"]
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, la sécurité de vos données est notre priorité. Nous utilisons des technologies de cryptage avancées et respectons strictement le RGPD. Vos informations personnelles ne sont jamais partagées sans votre consentement.",
    keywords: ["sécurité", "données", "confidentialité", "protection", "privé", "rgpd"]
  },
  {
    question: "Puis-je modifier mon profil après l'inscription ?",
    answer: "Bien sûr ! Vous pouvez modifier votre profil à tout moment depuis la page 'Mon profil'. Mettez à jour vos compétences, ajoutez de nouvelles expériences, modifiez vos informations personnelles. Les modifications sont prises en compte immédiatement pour améliorer vos recommandations.",
    keywords: ["modifier", "changer", "mettre à jour", "éditer", "profil"]
  },
  {
    question: "Comment puis-je contacter le support ?",
    answer: "Vous pouvez nous contacter via le formulaire de contact disponible sur le site, ou par email. Notre équipe est là pour vous aider et répondre à toutes vos questions dans les plus brefs délais.",
    keywords: ["contact", "support", "aide", "assistance", "help", "problème"]
  },
  {
    question: "Y a-t-il une application mobile ?",
    answer: "CareerNetwork est accessible depuis n'importe quel navigateur web, sur ordinateur, tablette ou smartphone. L'interface est entièrement responsive et optimisée pour tous les appareils. Une application mobile native est en développement !",
    keywords: ["mobile", "app", "application", "smartphone", "téléphone", "portable"]
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Bonjour ! Je suis l'assistant virtuel de CareerNetwork. Comment puis-je vous aider aujourd'hui ?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Recherche exacte par question
    const exactMatch = faqs.find(faq => 
      faq.question.toLowerCase() === lowerQuestion
    );
    if (exactMatch) return exactMatch.answer;

    // Recherche par mots-clés
    for (const faq of faqs) {
      const matchCount = faq.keywords.filter(keyword => 
        lowerQuestion.includes(keyword)
      ).length;
      if (matchCount > 0) {
        return faq.answer;
      }
    }

    // Réponse par défaut
    return "Je comprends votre question. Voici quelques informations utiles : CareerNetwork est une plateforme gratuite qui utilise l'IA pour vous proposer des offres d'emploi personnalisées. Créez votre profil pour commencer ! Pour plus d'informations, n'hésitez pas à nous contacter ou à explorer notre site.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simuler un délai de réponse du bot
    setTimeout(() => {
      const answer = findAnswer(inputValue);
      const botMessage: Message = {
        id: messages.length + 2,
        text: answer,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const quickQuestions = [
    "Qu'est-ce que CareerNetwork ?",
    "Comment ça fonctionne ?",
    "Est-ce gratuit ?",
    "Comment créer mon profil ?"
  ];

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 group premium-glow"
          aria-label="Ouvrir le chatbot"
        >
          <svg
            className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-indigo-200 dark:border-gray-700">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Assistant CareerNetwork</h3>
                <p className="text-white/80 text-xs">En ligne</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
              aria-label="Fermer le chatbot"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isBot
                      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md'
                      : 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                Questions fréquentes :
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tapez votre question..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-xl hover:from-indigo-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

