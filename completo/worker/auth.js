// Sites dispatch authenticates these headers before forwarding a request.
// Equivalent of the starter's getChatGPTUser for a dependency-free Worker.
export function getChatGPTUser(request) {
  const userId=request.headers.get('oai-authenticated-user-id');
  const email=request.headers.get('oai-authenticated-user-email');
  return userId && email ? {userId,email} : null;
}
export function canEdit(request, env) {
  const user=getChatGPTUser(request);
  const allowed=(env.ADMIN_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean);
  return !!user && allowed.includes(user.email.toLowerCase());
}
export function chatGPTSignInPath(returnTo='/') {
  if(!returnTo.startsWith('/') || returnTo.startsWith('//')) returnTo='/';
  return '/signin-with-chatgpt?return_to='+encodeURIComponent(returnTo);
}
