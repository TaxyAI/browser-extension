import { sleep } from '../../helpers/utils';

export default async function ripple(x: number, y: number) {
  const rippleRadius = 15;
  const ripple = document.createElement('div');
  ripple.classList.add('web-agent-ripple');
  ripple.style.width = ripple.style.height = `${rippleRadius * 2}px`;
  ripple.style.top = `${y - rippleRadius}px`;
  ripple.style.left = `${x - rippleRadius}px`;

  document.body.appendChild(ripple);

  await sleep(1000);
  ripple.remove();
}
