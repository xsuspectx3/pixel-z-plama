import { LEVELS } from './levels';
import { validateLevelSolvability } from './physics';

export function runLevelSolvabilityValidation(): boolean {
  console.log('%c[BİR PİKSEL KALDI!] Seviye Çözülebilirlik Doğrulaması Başlatılıyor...', 'color: #38bdf8; font-weight: bold;');
  let allPassed = true;

  for (const level of LEVELS) {
    const res = validateLevelSolvability(level);
    if (res.isSolvable) {
      console.log(`%c✓ Seviye ${level.id} (${level.name}): Başarılı (${res.jumpsChecked} zıplama doğrulandı)`, 'color: #4ade80;');
    } else {
      console.error(`✗ Seviye ${level.id} (${level.name}) ÇÖZÜLEMEZ!`, res.unsolvableJumps);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('%c✓ TÜM 10 SEVİYE MATEMATİKSEL VE FİZİKSEL OLARAK DOĞRULANDI!', 'color: #22c55e; font-weight: bold; font-size: 14px;');
  }
  return allPassed;
}
