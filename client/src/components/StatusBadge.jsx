import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'badge ';
  let text = '';

  switch (status) {
    case 'todo':
      badgeClass += 'badge-warning';
      text = 'To Do';
      break;
    case 'in_progress':
      badgeClass += 'badge-info';
      text = 'In Progress';
      break;
    case 'done':
      badgeClass += 'badge-success';
      text = 'Done';
      break;
    default:
      badgeClass += 'badge-brand';
      text = status;
  }

  return <span className={badgeClass}>{text}</span>;
};

export default StatusBadge;
