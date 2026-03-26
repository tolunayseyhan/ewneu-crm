import { Phone, MapPin, CheckSquare, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockAktivitaeten } from "@/lib/mock-data";
import { getInitials, formatDateTime } from "@/lib/utils";

const typeConfig = {
  anruf: { icon: Phone, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400", label: "Anruf" },
  besuch: { icon: MapPin, color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400", label: "Besuch" },
  aufgabe: { icon: CheckSquare, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400", label: "Aufgabe" },
  angebot: { icon: FileText, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400", label: "Angebot" },
  notiz: { icon: MessageSquare, color: "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400", label: "Notiz" },
};

export function ActivityFeed() {
  const activities = mockAktivitaeten.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Letzte Aktivitäten</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const config = typeConfig[activity.typ as keyof typeof typeConfig] || typeConfig.notiz;
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 mt-0.5 ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {activity.beschreibung}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-secondary">
                        {getInitials(activity.mitarbeiter_name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.mitarbeiter_name}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${config.color}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
