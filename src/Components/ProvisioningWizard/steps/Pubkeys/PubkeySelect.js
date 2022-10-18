import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Select, SelectOption, Spinner } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { PUBKEYS_QUERY_KEY } from '../../../../API/queryKeys';
import { fetchPubkeysList } from '../../../../API';
import { useWizardContext } from '../../../Common/WizardContext';

const selectOptionObj = (id, name) => ({
  id: id,
  toString: () => name,
  compareTo: (other) => other.id == id,
});

const PubkeySelect = ({ setStepValidated }) => {
  const [wizardContext, setWizardContext] = useWizardContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selection, setSelection] = React.useState(
    wizardContext.chosenSshKeyId
      ? selectOptionObj(
          wizardContext.chosenSshKeyId,
          wizardContext.chosenSshKeyName
        )
      : null
  );

  React.useEffect(() => {
    setStepValidated(!!selection);
  }, [selection]);

  const {
    isLoading,
    isError,
    data: pubkeys,
  } = useQuery(PUBKEYS_QUERY_KEY, fetchPubkeysList);

  const onSelect = (event, value) => {
    setWizardContext((prevState) => ({
      ...prevState,
      chosenSshKeyId: value.id,
      chosenSshKeyName: value.toString(),
    }));
    setSelection(value);
    setIsOpen(false);
  };

  if (isLoading) {
    return <Spinner isSVG size="sm" aria-label="Loading saved SSH keys" />;
  }

  if (isError || (pubkeys && pubkeys.length < 1)) {
    return (
      <>
        {isError && (
          <Alert
            ouiaId="pubkey_alert"
            variant="warning"
            isInline
            title="There are problems fetching saved SSH keys"
          />
        )}
        <Select
          ouiaId="pubkey_empty"
          isDisabled
          placeholderText="No SSH key found"
          aria-label="Select public key"
        />
      </>
    );
  }

  return (
    <Select
      ouiaId="select_pubkey"
      onToggle={(isExpanded) => setIsOpen(isExpanded)}
      onSelect={onSelect}
      isOpen={isOpen}
      selections={selection}
      placeholderText="Select public key..."
      aria-label="Select public key"
    >
      {pubkeys.map(({ id, name }) => (
        <SelectOption
          aria-label={`Public key ${name}`}
          key={id}
          value={selectOptionObj(id, name)}
        />
      ))}
    </Select>
  );
};

PubkeySelect.propTypes = {
  setStepValidated: PropTypes.func.isRequired,
};

export default PubkeySelect;
