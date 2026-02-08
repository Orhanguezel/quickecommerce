"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Target, Eye, Quote } from "lucide-react";

interface AboutSection {
  title: string;
  subtitle: string;
  description: string;
  image: number;
  image_url: string;
}

interface StepItem {
  title: string;
  subtitle: string | null;
  description?: string;
  image: number;
  image_url: string;
}

interface SectionWithSteps {
  title: string;
  subtitle: string;
  steps: StepItem[];
}

interface AboutContent {
  about_section: AboutSection;
  story_section: SectionWithSteps;
  mission_and_vision_section: SectionWithSteps;
  testimonial_and_success_section: SectionWithSteps;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AboutPageClientProps {
  title: string;
  content: AboutContent | null;
  breadcrumbs: Breadcrumb[];
}

export function AboutPageClient({ title, content, breadcrumbs }: AboutPageClientProps) {
  if (!content) {
    return (
      <div className="container py-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>Bu sayfa henüz hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  const { about_section, story_section, mission_and_vision_section, testimonial_and_success_section } = content;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* About Section */}
      {about_section && (
        <section className="mb-12">
          <h1 className="text-2xl font-bold tracking-tight">{about_section.title}</h1>
          <p className="mt-1 text-lg text-primary font-medium">{about_section.subtitle}</p>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
            {about_section.description}
          </p>
        </section>
      )}

      {/* Story Section */}
      {story_section && (
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight">{story_section.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{story_section.subtitle}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {story_section.steps.map((step, i) => (
              <div key={i} className="rounded-lg border p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mission & Vision Section */}
      {mission_and_vision_section && (
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight">{mission_and_vision_section.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{mission_and_vision_section.subtitle}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {mission_and_vision_section.steps.map((step, i) => (
              <div key={i} className="rounded-lg border p-6">
                <div className="mb-3 flex items-center gap-2">
                  {i === 0 ? (
                    <Target className="h-5 w-5 text-primary" />
                  ) : (
                    <Eye className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonial_and_success_section && (
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight">{testimonial_and_success_section.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{testimonial_and_success_section.subtitle}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {testimonial_and_success_section.steps.map((step, i) => (
              <div key={i} className="rounded-lg border p-5">
                <Quote className="mb-2 h-5 w-5 text-primary/40" />
                {step.description && (
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    &ldquo;{step.description}&rdquo;
                  </p>
                )}
                <div className="mt-3 border-t pt-3">
                  <p className="font-semibold text-sm">{step.title}</p>
                  {step.subtitle && (
                    <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
