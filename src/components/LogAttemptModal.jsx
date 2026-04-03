export default function LogAttemptModal({ onSolo, onHelped, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Log Attempt</h2>
        <p>Did you solve this on your own?</p>
        <div className="modal-actions">
          <button className="btn btn-success" onClick={onSolo}>
            Solved solo
          </button>
          <button className="btn btn-warning" onClick={onHelped}>
            Used solution
          </button>
        </div>
        <button className="btn btn-outline full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
