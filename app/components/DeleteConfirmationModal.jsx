import { Modal, Text } from "@shopify/polaris";
import PropTypes from "prop-types";

export function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading,
  itemName = "item",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete ${itemName}`}
      primaryAction={{
        content: "Delete",
        onAction: onConfirm,
        destructive: true,
        loading: loading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
          disabled: loading,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p">
          Are you sure you want to delete this {itemName}? This action cannot be
          undone.
        </Text>
      </Modal.Section>
    </Modal>
  );
}

DeleteConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  itemName: PropTypes.string,
};