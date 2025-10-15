import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageCircle, Send, Loader2, Sparkles } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Advisor
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Financial Advisor
          </SheetTitle>
          <SheetDescription>
            Ask questions about your finances and get personalized advice
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-120px)]">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Ask me anything about your financial situation
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  onClick={() => setInput("How can I improve my savings rate?")}
                  className="p-3 text-left hover:bg-muted rounded-lg transition-colors border"
                >
                  💡 How can I improve my savings rate?
                </button>
                <button
                  onClick={() => setInput("What should I prioritize: debt reduction or savings?")}
                  className="p-3 text-left hover:bg-muted rounded-lg transition-colors border"
                >
                  📊 What should I prioritize: debt reduction or savings?
                </button>
                <button
                  onClick={() => setInput("How does my net worth compare to others my age?")}
                  className="p-3 text-left hover:bg-muted rounded-lg transition-colors border"
                >
                  👥 How does my net worth compare to others my age?
                </button>
                <button
                  onClick={() => setInput("What are the most important changes I should make?")}
                  className="p-3 text-left hover:bg-muted rounded-lg transition-colors border"
                >
                  🎯 What are the most important changes I should make?
                </button>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your finances..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="sm">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
