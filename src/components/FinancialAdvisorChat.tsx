import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FinancialAdvisorChatProps {
  metrics: any;
}

export function FinancialAdvisorChat({ metrics }: FinancialAdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('financial-advisor', {
        body: {
          messages: [...messages, userMessage],
          metrics,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('402')) {
          toast.error('AI service requires payment. Please add credits to continue.');
        } else {
          toast.error('Failed to get AI response');
        }
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI advisor:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-accent/5 via-accent/3 to-transparent">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>AI Financial Advisor</CardTitle>
            <CardDescription>Ask questions about your finances and get personalized advice</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {messages.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask me anything about your financial situation
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setInput("How can I improve my savings rate?")}
                className="p-2 text-left hover:bg-muted rounded-lg transition-colors"
              >
                💡 Improve savings rate
              </button>
              <button
                onClick={() => setInput("What should I prioritize: debt reduction or savings?")}
                className="p-2 text-left hover:bg-muted rounded-lg transition-colors"
              >
                📊 Debt vs savings priority
              </button>
              <button
                onClick={() => setInput("How does my net worth compare to others my age?")}
                className="p-2 text-left hover:bg-muted rounded-lg transition-colors"
              >
                👥 Net worth comparison
              </button>
              <button
                onClick={() => setInput("What are the most important changes I should make?")}
                className="p-2 text-left hover:bg-muted rounded-lg transition-colors"
              >
                🎯 Key changes needed
              </button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2.5 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-2.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex gap-2 mt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1 h-9 text-sm"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="sm">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
