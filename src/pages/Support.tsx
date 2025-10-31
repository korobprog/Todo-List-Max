import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Support = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    // Here you can integrate with backend/email if needed
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Поддержка
              </h1>
              <p className="text-sm text-muted-foreground">Свяжитесь с нами</p>
            </div>
          </div>
        </header>

        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle>Форма поддержки</CardTitle>
            <CardDescription>Мы ответим на ваш запрос в ближайшее время</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support-name">Имя</Label>
                  <Input
                    id="support-name"
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-phone">Телефон</Label>
                <Input
                  id="support-phone"
                  type="tel"
                  placeholder="Например: 79991234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.slice(0, 12))}
                  inputMode="tel"
                  maxLength={12}
                  className="rounded-xl"
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Сообщение</Label>
                <Textarea
                  id="support-message"
                  placeholder="Опишите ваш вопрос"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="rounded-xl min-h-32"
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="support-consent" checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
                <Label htmlFor="support-consent" className="text-sm text-muted-foreground">
                  Соглашаюсь на обработку персональных данных согласно{' '}
                  <Link to="/privacy" className="text-primary underline">
                    Политике конфиденциальности
                  </Link>
                </Label>
              </div>

              <div className="pt-2">
                <Button type="submit" className="rounded-2xl" disabled={!consent}>
                  Отправить
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;


