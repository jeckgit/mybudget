<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
    <div class="min-h-dvh pt-20 pb-24 px-6 md:px-0">
        <GlassCard variant="white" class="max-w-3xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header class="mb-8 border-b border-slate-100 dark:border-white/10 pb-6">
                <NuxtLink to="/legal"
                    class="inline-flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-4 text-sm font-medium">
                    ← {{ t('legal.back') }}
                </NuxtLink>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-white">{{ t('legal.imprint') }}</h1>
            </header>

            <div class="prose dark:prose-invert max-w-none">
                <h2>Angaben gemäß § 5 TMG</h2>
                <p>
                    Max Mustermann<br />
                    Musterstraße 1<br />
                    12345 Musterstadt
                </p>

                <h2>Kontakt</h2>
                <p>
                    Telefon: +49 (0) 123 44 55 66<br />
                    E-Mail: mustermann@musterfirma.de
                </p>

                <h2>Haftung für Inhalte</h2>
                <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                    allgemeinen
                    Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                    verpflichtet,
                    übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen,
                    die auf
                    eine rechtswidrige Tätigkeit hinweisen.
                </p>

                <h2>Haftung für Links</h2>
                <p>
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss
                    haben.
                    Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
                    verlinkten
                    Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
            </div>
        </GlassCard>
    </div>
</template>
