import Link from 'next/link'
import { MapPin, Clock, MessageSquare, CheckCircle2, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { cn, getInitials, PLAN_LABELS } from '@/lib/utils'
import type { LawyerProfile } from '@/types'

interface LawyerCardProps {
  lawyer: LawyerProfile
  className?: string
}

export function LawyerCard({ lawyer, className }: LawyerCardProps) {
  const profile = lawyer.profile
  const primarySpecialty = lawyer.specialties?.find((s) => s.is_primary) ?? lawyer.specialties?.[0]
  const isVerified = lawyer.verification_status === 'verified'
  const isPremium = lawyer.plan === 'premium'
  const isProfessional = lawyer.plan === 'professional'
  const profileUrl = `/abogados/${lawyer.slug ?? lawyer.user_id}`

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-md transition-all duration-300',
        isPremium && 'ring-2 ring-amber-400/40',
        className
      )}
    >
      {isPremium && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-white fill-white" />
          <span className="text-xs font-semibold text-white">PERFIL DESTACADO</span>
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-16 w-16">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-lg">
                {getInitials(profile?.full_name ?? 'AB')}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background">
                <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-50" />
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={profileUrl}
                  className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {profile?.full_name ?? 'Abogado'}
                </Link>
                {primarySpecialty?.category && (
                  <p className="text-sm text-muted-foreground">
                    {primarySpecialty.category.name}
                  </p>
                )}
              </div>
              {(isPremium || isProfessional) && (
                <Badge variant={isPremium ? 'premium' : 'default'} className="shrink-0">
                  {PLAN_LABELS[lawyer.plan]}
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="mt-1.5 flex items-center gap-2">
              <StarRating
                rating={lawyer.rating_avg}
                size="sm"
                showValue
                count={lawyer.rating_count}
              />
            </div>

            {/* Meta */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {profile?.province && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {profile.city ? `${profile.city}, ` : ''}{profile.province.name}
                </span>
              )}
              {lawyer.response_time_hours !== null && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Resp. en ~{lawyer.response_time_hours}h
                </span>
              )}
              {lawyer.cases_handled > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {lawyer.cases_handled} casos
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Especialidades adicionales */}
        {lawyer.specialties && lawyer.specialties.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lawyer.specialties.slice(0, 4).map((s) => (
              <Badge key={s.category_id} variant="secondary" className="text-xs">
                {s.category?.name}
              </Badge>
            ))}
            {lawyer.specialties.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{lawyer.specialties.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Bio corta */}
        {profile?.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
        )}

        {/* Acciones */}
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={profileUrl}>Ver perfil</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/mensajes/nuevo?abogado=${lawyer.user_id}`}>
              <MessageSquare className="h-3.5 w-3.5" />
              Contactar
            </Link>
          </Button>
        </div>

        {/* Disponibilidad */}
        {!lawyer.accepts_new_clients && (
          <p className="mt-2 text-xs text-center text-amber-600 font-medium">
            No acepta nuevos clientes en este momento
          </p>
        )}
      </CardContent>
    </Card>
  )
}
