export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const { initApp } = useAppSync();
  const profileStore = useProfileStore();

  // 1. Block guests from protected routes
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/update-password', '/confirm', '/'];
  // Check if the current path is public
  const isPublic = publicRoutes.some((path) => to.path === path || to.path.startsWith(path + '/'));

  if (!user.value && !isPublic) {
    return navigateTo('/auth/login');
  }

  // 2. If user is logged in, ensure state is valid
  if (user.value) {
    // Ensure state is loaded. initApp() handles deduplication and checks if data is already present.
    await initApp();

    const isOnboardingComplete = profileStore.config.value.onboardingComplete;

    // A. User needs onboarding but is somewhere else -> Send to onboarding
    if (!isOnboardingComplete && to.path !== '/onboarding') {
      return navigateTo('/onboarding');
    }

    // B. User is done with onboarding but tries to go back -> Send to dashboard
    if (isOnboardingComplete && to.path === '/onboarding') {
      return navigateTo('/dashboard');
    }

    // C. Authenticated user on public pages (login, register, landing) -> Send to dashboard
    if (isOnboardingComplete && (to.path === '/auth/login' || to.path === '/')) {
      return navigateTo('/dashboard');
    }
  }
});
