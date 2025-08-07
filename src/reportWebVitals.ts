// Remova o import do ReportHandler
import { getCLS, getFID, getLCP } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (entry: any) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getLCP(onPerfEntry);
  }
};

export default reportWebVitals;
