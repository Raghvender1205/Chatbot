import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface UserProfileCardProps {
    name: string
    email: string
    role: string
    avatarUrl?: string
}

export function UserProfileCard({ name, email, role, avatarUrl }: UserProfileCardProps) {
    return (
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm"><strong>Email:</strong> {email}</p>
          </CardContent>
        </Card>
    )
}