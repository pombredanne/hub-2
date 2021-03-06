import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { mocked } from 'ts-jest/utils';

import { API } from '../../api';
import { ErrorKind, Stats } from '../../types';
import HomeView from './index';
jest.mock('../../api');
jest.mock('./SearchTip', () => () => <div />);
jest.mock('../common/SampleQueries', () => () => <div />);
jest.mock('./RandomPackages', () => () => <div />);

const getMockStats = (fixtureId: string): Stats => {
  return require(`./__fixtures__/index/${fixtureId}.json`) as Stats;
};

const defaultProps = {
  isSearching: true,
  onOauthFailed: false,
};

describe('Home index', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', async () => {
    const mockStats = getMockStats('1');
    mocked(API).getStats.mockResolvedValue(mockStats);

    const result = render(
      <Router>
        <HomeView {...defaultProps} />
      </Router>
    );
    expect(result.asFragment()).toMatchSnapshot();
    await waitFor(() => {});
  });

  describe('Render', () => {
    it('renders component', async () => {
      const mockStats = getMockStats('2');
      mocked(API).getStats.mockResolvedValue(mockStats);

      render(
        <Router>
          <HomeView {...defaultProps} />
        </Router>
      );
      expect(API.getStats).toHaveBeenCalledTimes(1);
      await waitFor(() => {});
    });

    it('renders dash symbol when results are 0', async () => {
      const mockStats = getMockStats('4');
      mocked(API).getStats.mockResolvedValue(mockStats);

      const props = {
        ...defaultProps,
        isSearching: true,
      };

      const { getAllByText } = render(
        <Router>
          <HomeView {...props} />
        </Router>
      );

      const emptyStats = await waitFor(() => getAllByText('-'));

      expect(emptyStats).toHaveLength(2);
      await waitFor(() => {});
    });

    it('renders dash symbol when getStats call fails', async () => {
      mocked(API).getStats.mockRejectedValue({ kind: ErrorKind.Other });

      const props = {
        ...defaultProps,
        isSearching: true,
      };

      const { getAllByText } = render(
        <Router>
          <HomeView {...props} />
        </Router>
      );

      await waitFor(() => expect(API.getStats).toHaveBeenCalledTimes(1));
      expect(getAllByText('-')).toHaveLength(2);
    });

    it('renders project definition', async () => {
      const mockStats = getMockStats('5');
      mocked(API).getStats.mockResolvedValue(mockStats);

      const { getByRole, getByText } = render(
        <Router>
          <HomeView {...defaultProps} />
        </Router>
      );

      const heading = await waitFor(() => getByRole('heading'));

      expect(heading).toBeInTheDocument();
      expect(getByText('Find, install and publish')).toBeInTheDocument();
      expect(getByText('Kubernetes packages')).toBeInTheDocument();
      await waitFor(() => {});
    });
  });

  describe('External links', () => {
    it('renders proper links', async () => {
      const mockStats = getMockStats('5');
      mocked(API).getStats.mockResolvedValue(mockStats);

      const { getAllByRole } = render(
        <Router>
          <HomeView {...defaultProps} />
        </Router>
      );

      await waitFor(() => expect(API.getStats).toHaveBeenCalledTimes(1));

      const links = getAllByRole('button');
      expect(links).toHaveLength(10);

      expect(links[2]).toHaveProperty('href', 'https://github.com/cncf/hub');
      expect(links[3]).toHaveProperty('href', 'https://cloud-native.slack.com/channels/artifact-hub');
      expect(links[4]).toHaveProperty('href', 'https://twitter.com/cncfartifacthub');

      // Packages
      expect(links[5]).toHaveProperty('href', 'https://helm.sh/');
      expect(links[6]).toHaveProperty('href', 'https://falco.org/');
      expect(links[7]).toHaveProperty('href', 'https://www.openpolicyagent.org/');
      expect(links[8]).toHaveProperty('href', 'https://github.com/operator-framework');

      expect(links[9]).toHaveProperty('href', 'https://www.cncf.io/sandbox-projects/');
    });
  });
});
