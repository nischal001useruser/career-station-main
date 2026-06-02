// Chart color schemes
export const chartColors = {
  primary: 'rgb(14, 116, 144)',
  secondary: 'rgb(59, 130, 246)',
  success: 'rgb(16, 185, 129)',
  warning: 'rgb(245, 158, 11)',
  danger: 'rgb(239, 68, 68)',
  muted: 'rgb(148, 163, 184)',
}

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 14,
        boxWidth: 10,
        color: '#1e293b',
        font: {
          size: 11,
          weight: '600',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      cornerRadius: 10,
      padding: 12,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.16)',
      },
      ticks: {
        color: '#64748b',
      },
    },
  },
}
