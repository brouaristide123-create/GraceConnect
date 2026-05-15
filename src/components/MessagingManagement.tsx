import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore, Conversation, Message, Member } from '../lib/store';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Users, 
  User, 
  Hash, 
  Bell, 
  Archive, 
  Trash2, 
  Star, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  Info,
  BarChart3,
  Megaphone,
  Calendar,
  X,
  Paperclip as AttachmentIcon,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export function MessagingManagement() {
  const { 
    conversations, 
    messages, 
    members, 
    addMessage, 
    addConversation, 
    markAsRead,
    departments,
    churchProjects,
    events
  } = useStore();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'direct'>('all');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = { id: '1', name: 'Jean Koffi' }; // Mock current user

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId, currentUser.id);
    }
  }, [activeConversationId, messages.length]);

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId), 
    [conversations, activeConversationId]
  );

  const activeMessages = useMemo(() => 
    messages.filter(m => m.conversationId === activeConversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages, activeConversationId]
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const name = c.type === 'group' ? c.name : members.find(m => m.id === c.participants.find(p => p !== currentUser.id))?.firstName;
      const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || (activeTab === 'groups' ? c.type === 'group' : c.type === 'individual');
      return matchesSearch && matchesTab;
    });
  }, [conversations, searchTerm, activeTab, members]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeConversationId) return;

    addMessage({
      conversationId: activeConversationId,
      senderId: currentUser.id,
      content: messageInput,
    });
    setMessageInput('');
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group') return conv.name;
    const otherParticipantId = conv.participants.find(p => p !== currentUser.id);
    const member = members.find(m => m.id === otherParticipantId);
    return member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'group') return <Users className="w-4 h-4" />;
    const otherParticipantId = conv.participants.find(p => p !== currentUser.id);
    const member = members.find(m => m.id === otherParticipantId);
    return member ? `${member.firstName[0]}${member.lastName[0]}` : '?';
  };

  const formatMessageTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Hier';
    return format(date, 'dd/MM');
  };

  const unreadCount = (convId: string) => {
    return messages.filter(m => m.conversationId === convId && !(m.readBy || []).includes(currentUser.id)).length;
  };

  const stats = useMemo(() => {
    const totalMessages = messages.length;
    const sentByMe = messages.filter(m => m.senderId === currentUser.id).length;
    const activeGroups = conversations.filter(c => c.type === 'group').length;
    return { totalMessages, sentByMe, activeGroups };
  }, [messages, conversations]);

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-slate-900">Messagerie</h2>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
                  <Plus className="w-5 h-5" />
                </Button>
              } />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Discussion</DialogTitle>
                  <DialogDescription>Choisissez un membre ou un groupe pour commencer à discuter.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destinataire</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none">
                      <option value="">Sélectionner...</option>
                      {members.filter(m => m.id !== currentUser.id).map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message initial</label>
                    <Input placeholder="Bonjour..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsNewChatOpen(false)} className="bg-slate-900">Démarrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-9 bg-white border-slate-200 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="w-full bg-slate-200/50 p-1 h-9">
              <TabsTrigger value="all" className="flex-1 text-xs">Tous</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1 text-xs">Groupes</TabsTrigger>
              <TabsTrigger value="direct" className="flex-1 text-xs">Direct</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 pb-4 space-y-1">
            {filteredConversations.map((conv) => {
              const lastMsg = messages.filter(m => m.conversationId === conv.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
              const unread = unreadCount(conv.id);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                    activeConversationId === conv.id 
                      ? "bg-white shadow-sm ring-1 ring-slate-200" 
                      : "hover:bg-slate-100"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    conv.type === 'group' ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
                  )}>
                    {getConversationAvatar(conv)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-slate-900 truncate">{getConversationName(conv)}</span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400">{formatMessageTime(lastMsg.timestamp)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate pr-4">
                        {lastMsg ? lastMsg.content : 'Aucun message'}
                      </p>
                      {unread > 0 && (
                        <Badge className="bg-blue-600 text-[10px] h-4 min-w-[1rem] px-1 rounded-full flex items-center justify-center">
                          {unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                  activeConversation.type === 'group' ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
                )}>
                  {getConversationAvatar(activeConversation)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{getConversationName(activeConversation)}</h3>
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    En ligne
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Star className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuItem><Info className="w-4 h-4 mr-2" /> Infos du groupe</DropdownMenuItem>
                      <DropdownMenuItem><Bell className="w-4 h-4 mr-2" /> Muet</DropdownMenuItem>
                      <DropdownMenuItem><Archive className="w-4 h-4 mr-2" /> Archiver</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-600"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-[10px] text-slate-400 bg-slate-50 border-slate-100">
                    Aujourd'hui
                  </Badge>
                </div>
                {activeMessages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id;
                  const sender = members.find(m => m.id === msg.senderId);
                  const showSender = !isMe && (idx === 0 || activeMessages[idx-1].senderId !== msg.senderId);
                  
                  return (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[80%]",
                      isMe ? "ml-auto items-end" : "items-start"
                    )}>
                      {showSender && activeConversation.type === 'group' && (
                        <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">
                          {sender ? `${sender.firstName} ${sender.lastName}` : 'Inconnu'}
                        </span>
                      )}
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-sm shadow-sm",
                        isMe 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-slate-100 text-slate-800 rounded-tl-none"
                      )}>
                        {msg.content}
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isMe ? "justify-end" : "justify-start"
                        )}>
                          <span className={cn(
                            "text-[9px]",
                            isMe ? "text-slate-400" : "text-slate-500"
                          )}>
                            {format(parseISO(msg.timestamp), 'HH:mm')}
                          </span>
                          {isMe && (
                            msg.readBy.length > 1 
                              ? <CheckCheck className="w-3 h-3 text-blue-400" /> 
                              : <Check className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex gap-1 mb-1">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600 rounded-full">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600 rounded-full">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    placeholder="Écrivez votre message..."
                    className="w-full bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-1 focus:ring-slate-200"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "h-10 w-10 rounded-full transition-all shrink-0",
                    messageInput.trim() ? "bg-slate-900 text-white scale-100" : "bg-slate-100 text-slate-400 scale-90"
                  )}
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Vos Messages</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Sélectionnez une conversation pour commencer à discuter avec vos membres ou vos groupes.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 border-slate-200"
              onClick={() => setIsNewChatOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle discussion
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Stats & Info (Optional/Collapsible) */}
      <div className="w-72 border-l border-slate-100 bg-slate-50/30 p-6 hidden xl:block">
        <div className="space-y-8">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Statistiques</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                  Total messages
                </div>
                <span className="font-bold">{stats.totalMessages}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  Groupes actifs
                </div>
                <span className="font-bold">{stats.activeGroups}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  Réactivité
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-none">Haute</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Annonces Rapides</h4>
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <Megaphone className="w-6 h-6 text-blue-400" />
              <p className="text-xs font-medium leading-relaxed">
                Besoin d'envoyer une annonce à toute l'église ?
              </p>
              <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100 text-[10px] h-7">
                Créer un Broadcast
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fichiers récents</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold truncate">Programme_Dimanche.pdf</p>
                  <p className="text-[9px] text-slate-400">1.2 MB • Hier</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold truncate">Photo_Evenement.jpg</p>
                  <p className="text-[9px] text-slate-400">2.4 MB • 2 j.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
