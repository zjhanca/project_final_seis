import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  onConfirm,
  confirmButtonClass = "btn-primary",
  showConfirmButton = true 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {(showConfirmButton || onConfirm) && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              {cancelText}
            </button>
            {showConfirmButton && (
              <button 
                className={`btn ${confirmButtonClass}`} 
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;