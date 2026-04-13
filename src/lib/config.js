/**
 * Site genelinde kullanılan yapılandırma ayarları.
 * Cloudflare deployment'larında environment variable sorunlarını önlemek için 
 * buradaki değerler doğrudan hardcoded olarak tutulmaktadır.
 */

export const CONFIG = {
  POCKETBASE_URL: "https://pb.yunusemredemirtas.com",
  EMAILJS: {
    SERVICE_ID: "service_ep6iv2m",
    TEMPLATE_ID: "template_14xg1j8",
    PUBLIC_KEY: "xhSSU8nOBwOTfo2fO",
  }
};
