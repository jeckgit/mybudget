<script setup lang="ts">
const { t } = useI18n();
useHead({ title: t('legal.privacy') })
</script>

<template>
    <div class="min-h-dvh pt-20 pb-24 px-6 md:px-0">
        <GlassCard variant="white" class="max-w-3xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header class="mb-8 border-b border-slate-100 dark:border-white/10 pb-6">
                <NuxtLink to="/legal"
                    class="inline-flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-4 text-sm font-medium">
                    ← {{ t('legal.back') }}
                </NuxtLink>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-white">{{ t('legal.privacy') }}</h1>
            </header>

            <div class="prose dark:prose-invert max-w-none">
                <h2>1. Datenschutz auf einen Blick</h2>
                <h3>Allgemeine Hinweise</h3>
                <p>
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
                    Daten passiert,
                    wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
                    identifiziert werden können.
                </p>

                <h3>Datenerfassung auf dieser Website</h3>
                <p>
                    <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                    Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                    können Sie
                    dem Impressum dieser Website entnehmen.
                </p>

                <h2>2. Hosting und Content Delivery Networks (CDN)</h2>
                <h3>Externes Hosting</h3>
                <p>
                    Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten,
                    die auf
                    dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich
                    v. a. um
                    IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen,
                    Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
                </p>
                <p>
                    Wir setzen folgenden Hoster ein: [Name des Hosters, z.B. Vercel / Netlify / Supabase]
                </p>

                <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
                <h3>Datenschutz</h3>
                <p>
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln
                    Ihre
                    personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie
                    dieser
                    Datenschutzerklärung.
                </p>
            </div>
        </GlassCard>
    </div>
</template>
