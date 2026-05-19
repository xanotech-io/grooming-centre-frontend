import { Badge } from '@chakra-ui/react';

const ALERT_STYLES = {
  warning: { bg: '#FEF0C7', color: '#B54708', label: 'Warning' },
  violation: { bg: '#FEE4E2', color: '#D92D20', label: 'Violation' },
  system_flag: { bg: '#EEF4FF', color: '#3538CD', label: 'System Flag' },
};

const AlertTypeBadge = ({ type }) => {
  const style = ALERT_STYLES[type?.toLowerCase()] ?? { bg: '#F3F4F6', color: '#344054', label: type ?? '—' };
  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      fontSize="12px"
      fontWeight="600"
      textTransform="none"
      bg={style.bg}
      color={style.color}
    >
      {style.label}
    </Badge>
  );
};

export default AlertTypeBadge;
