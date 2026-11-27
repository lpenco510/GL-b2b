import { redirect } from 'next/navigation';

// Ruta legacy: Corporate Wellness y Coach Studio ahora tienen workspace propio.
export default function CorporateCoachLegacy() {
  redirect('/corporate');
}
