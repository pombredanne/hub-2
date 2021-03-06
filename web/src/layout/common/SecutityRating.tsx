import { isNull, isUndefined } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SecurityReportSummary, SeverityRating as SRating, VulnerabilitySeverity } from '../../types';
import { SEVERITY_RATING } from '../../utils/data';
import ElementWithTooltip from './ElementWithTooltip';
import Label from './Label';
import styles from './SecurityRating.module.css';

interface Props {
  summary: SecurityReportSummary | null;
  className?: string;
  onlyBadge: boolean;
  withLink?: string;
}

const SecurityRating = (props: Props) => {
  const history = useHistory();
  const [severity, setSeverity] = useState<SRating | undefined>();

  useEffect(() => {
    let rating = SEVERITY_RATING.default!;
    for (const key in VulnerabilitySeverity) {
      const sev = key.toLowerCase();
      if (!isNull(props.summary) && props.summary.hasOwnProperty(sev) && (props.summary as any)[sev] > 0) {
        rating = SEVERITY_RATING[sev as VulnerabilitySeverity]!;
        break;
      }
    }
    setSeverity(rating);
  }, [props.summary]);

  if (isNull(props.summary) || isUndefined(severity)) return null;

  const badge = (className?: string) => (
    <ElementWithTooltip
      className={className}
      element={
        props.onlyBadge ? (
          <small>
            <div
              className={`badge badge-pill text-light font-weight-bold ${styles.badge} ${className}`}
              style={{
                backgroundColor: severity.color,
              }}
            >
              {severity.level}
            </div>
          </small>
        ) : (
          <Label
            className={className}
            text="Images Security Rating"
            bgRightIcon={severity.color}
            rightIcon={<>{severity.level}</>}
          />
        )
      }
      alignmentTooltip="right"
      tooltipClassName={styles.tooltip}
      tooltipArrowClassName={styles.tooltipArrow}
      tooltipMessage={
        <div className="d-flex flex-column">
          <div className="d-flex flex-row align-items-center my-1">
            <span
              className={`badge badge-pill text-light font-weight-bold mr-2 ${styles.badge}`}
              style={{
                backgroundColor: SEVERITY_RATING.default!.color,
              }}
            >
              {SEVERITY_RATING.default!.level}
            </span>
            <div>No vulnerabilities found</div>
          </div>
          <div className="d-flex flex-row align-items-center my-1">
            <span
              className={`badge badge-pill text-light font-weight-bold mr-2 ${styles.badge}`}
              style={{
                backgroundColor: SEVERITY_RATING[VulnerabilitySeverity.Low]!.color,
              }}
            >
              {SEVERITY_RATING[VulnerabilitySeverity.Low]!.level}
            </span>
            <div>
              Vulnerabilities of severity <span className="font-weight-bold">LOW</span> found
            </div>
          </div>
          <div className="d-flex flex-row align-items-center my-1">
            <span
              className={`badge badge-pill text-light font-weight-bold mr-2 ${styles.badge}`}
              style={{
                backgroundColor: SEVERITY_RATING[VulnerabilitySeverity.Medium]!.color,
              }}
            >
              {SEVERITY_RATING[VulnerabilitySeverity.Medium]!.level}
            </span>
            <div>
              Vulnerabilities of severity <span className="font-weight-bold">MEDIUM</span> found
            </div>
          </div>
          <div className="d-flex flex-row align-items-center my-1">
            <span
              className={`badge badge-pill text-light font-weight-bold mr-2 ${styles.badge}`}
              style={{
                backgroundColor: SEVERITY_RATING[VulnerabilitySeverity.High]!.color,
              }}
            >
              {SEVERITY_RATING[VulnerabilitySeverity.High]!.level}
            </span>
            <div>
              Vulnerabilities of severity <span className="font-weight-bold">HIGH</span> found
            </div>
          </div>
          <div className="d-flex flex-row align-items-center my-1">
            <span
              className={`badge badge-pill text-light font-weight-bold mr-2 ${styles.badge}`}
              style={{
                backgroundColor: SEVERITY_RATING[VulnerabilitySeverity.Critical]!.color,
              }}
            >
              {SEVERITY_RATING[VulnerabilitySeverity.Critical]!.level}
            </span>
            <div>
              Vulnerabilities of severity <span className="font-weight-bold">CRITICAL</span> found
            </div>
          </div>
        </div>
      }
      visibleTooltip
      active
    />
  );

  return (
    <>
      {props.withLink ? (
        <div className={props.className}>
          <button
            className={`btn btn-link text-reset p-0 ${styles.link}`}
            onClick={(e) => {
              e.preventDefault();
              history.push({
                pathname: props.withLink,
                search: '?modal=security-report',
              });
            }}
          >
            {badge()}
          </button>
        </div>
      ) : (
        <>{badge(props.className)}</>
      )}
    </>
  );
};

export default SecurityRating;
