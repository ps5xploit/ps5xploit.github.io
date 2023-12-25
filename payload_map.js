const payload_map = [
  {
    displayTitle: 'etaHEN',
    description: '', // Dejar "description" vacío
    info: 'Descripción de etaHEN', // Mantener "info"
    fileName: 'etaHEN-1.2B.bin',
    author: 'LM',
    version: '?'
  },
  {
    displayTitle: 'libhijacker game-patch',
    description: '', // Dejar "description" vacío
    info: 'Descripción de libhijacker game-patch', // Mantener "info"
    fileName: 'libhijacker-spawner-1.124.elf;libhijacker-daemon-1.124.elf',
    author: 'illusion0001, astrelsky',
    source: 'https://github.com/illusion0001/libhijacker/releases',
    loader: 'libhijacker',
    version: '1.124'
  },
  {
    displayTitle: 'HW Info',
    description: '', // Dejar "description" vacío
    info: 'Descripción de HW Info', // Mantener "info"
    fileName: 'hwinfo-tornblom.elf',
    author: '?',
    source: '?',
    version: '?'
  },
  {
    displayTitle: 'Remove Cache',
    description: '', // Dejar "description" vacío
    info: 'Descripción de Remove Cache', // Mantener "info"
    fileName: 'Browser_appCache_remove.elf',
    author: 'Storm21CH',
    version: '1.0fix'
  },
  {
    displayTitle: 'Version',
    description: '', // Dejar "description" vacío
    info: 'Descripción de Versions', // Mantener "info"
    fileName: 'versions.elf',
    author: '?',
    version: '1.0'
  },
  {
    displayTitle: 'Fan control',
    description: '', // Dejar "description" vacío
    info: 'Descripción de Fan control', // Mantener "info"
    fileName: 'fan_threshold.elf',
    author: '?',
    source: '?',
    version: '1.0'
  },
   {
            displayTitle: 'Backup DB',
            description: '', // Dejar "description" vacío
            fileName: 'Backup-db-PS5.bin',
            info: 'Descripción de Backup DB', // Mantener "info"
            author: '?',
            source:'?',
            version: '0.5'
        },
  {
            displayTitle: 'Kstuff',
            description: '', // Dejar "description" vacío
            fileName: 'ps5-kstuff-v1.2.bin',
            info: 'Descripción de Kstuff', // Mantener "info"
            author: 'sleirsgoevy',
            source: 'https://github.com/sleirsgoevy/ps4jb2/blob/ps5-403/ps5-kstuff.bin',
            version: '1.1'
        },
];

// JavaScript para mostrar info en lugar de description
const btns = document.querySelectorAll('.btn');
const infoElement = document.getElementById('info'); // Obtén el elemento de info por su ID

btns.forEach(btn => {
  btn.addEventListener('mouseover', () => {
    const info = btn.getAttribute('data-info');
    infoElement.textContent = info; // Actualiza el contenido del elemento de info
  });

  btn.addEventListener('mouseout', () => {
    infoElement.textContent = ''; // Limpia el contenido cuando el ratón sale del elemento
  });
});
