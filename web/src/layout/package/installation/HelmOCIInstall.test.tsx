import { render } from '@testing-library/react';
import React from 'react';

import { Repository } from '../../../types';
import HelmOCIInstall from './HelmOCIInstall';

const repo: Repository = {
  kind: 0,
  name: 'repo',
  displayName: 'Repo',
  url: 'oci://ghcr.io/artifacthub/artifact-hub',
  userAlias: 'user',
};
const defaultProps = {
  name: 'packageName',
  version: '1.0.0',
  repository: repo,
};

describe('HelmOCIInstall', () => {
  it('creates snapshot', () => {
    const result = render(<HelmOCIInstall {...defaultProps} />);
    expect(result.asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component', () => {
      const { getByText, getAllByText } = render(<HelmOCIInstall {...defaultProps} />);

      expect(getByText('Helm v3 (OCI)')).toBeInTheDocument();
      expect(getByText('Enable OCI support')).toBeInTheDocument();
      expect(getByText('HELM_EXPERIMENTAL_OCI=1')).toBeInTheDocument();
      expect(getByText('Pull chart from remote')).toBeInTheDocument();
      expect(getAllByText(/ghcr.io\/artifacthub\/artifact-hub:1.0.0/g)).toHaveLength(2);
      expect(getByText('Export chart to directory')).toBeInTheDocument();
      expect(getByText('Install chart')).toBeInTheDocument();
      expect(getByText('helm install my-packageName ./packageName')).toBeInTheDocument();
    });

    it('does not render content when version is undefined', () => {
      const { container } = render(<HelmOCIInstall {...defaultProps} version={undefined} />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
