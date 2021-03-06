package hub

import (
	"context"
	"errors"

	helmrepo "helm.sh/helm/v3/pkg/repo"
)

const (
	// RepositoryMetadataFile represents the name of the file where the
	// Artifact Hub metadata for a given repository is stored.
	RepositoryMetadataFile = "artifacthub-repo"

	// RepositoryOCIPrefix represents the prefix expected in the url when the
	// repository is stored in a OCI registry.
	RepositoryOCIPrefix = "oci://"
)

// RepositoryKind represents the kind of a given repository.
type RepositoryKind int64

const (
	// Helm represents a repository with Helm charts.
	Helm RepositoryKind = 0

	// Falco represents a repository with Falco rules.
	Falco RepositoryKind = 1

	// OPA represents a repository with OPA policies.
	OPA RepositoryKind = 2

	// OLM represents a repository with OLM operators.
	OLM RepositoryKind = 3
)

// GetKindName returns the name of the provided repository kind.
func GetKindName(kind RepositoryKind) string {
	switch kind {
	case Helm:
		return "helm"
	case Falco:
		return "falco"
	case OPA:
		return "opa"
	case OLM:
		return "olm"
	default:
		return ""
	}
}

// GetKindFromName returns the kind of the provided repository from the name
// provided.
func GetKindFromName(kind string) (RepositoryKind, error) {
	switch kind {
	case "helm":
		return Helm, nil
	case "falco":
		return Falco, nil
	case "olm":
		return OLM, nil
	case "opa":
		return OPA, nil
	default:
		return -1, errors.New("invalid kind name")
	}
}

// HelmIndexLoader interface defines the methods a Helm index loader
// implementation should provide.
type HelmIndexLoader interface {
	LoadIndex(r *Repository) (*helmrepo.IndexFile, error)
}

// OLMRepositoryExporter describes the methods an OLMRepositoryExporter
// implementation must provide.
type OLMRepositoryExporter interface {
	ExportRepository(ctx context.Context, r *Repository) (tmpDir string, err error)
}

// Owner represents some details about a repository's owner.
type Owner struct {
	Name  string `yaml:"name"`
	Email string `yaml:"email"`
}

// Repository represents a packages repository.
type Repository struct {
	RepositoryID            string         `json:"repository_id"`
	Name                    string         `json:"name"`
	DisplayName             string         `json:"display_name"`
	URL                     string         `json:"url"`
	Private                 bool           `json:"private"`
	AuthUser                string         `json:"auth_user"`
	AuthPass                string         `json:"auth_pass"`
	Kind                    RepositoryKind `json:"kind"`
	UserID                  string         `json:"user_id"`
	UserAlias               string         `json:"user_alias"`
	OrganizationID          string         `json:"organization_id"`
	OrganizationName        string         `json:"organization_name"`
	OrganizationDisplayName string         `json:"organization_display_name"`
	LastTrackingErrors      string         `json:"last_tracking_errors"`
	VerifiedPublisher       bool           `json:"verified_publisher"`
	Official                bool           `json:"official"`
}

// RepositoryCloner describes the methods a RepositoryCloner implementation
// must provide.
type RepositoryCloner interface {
	// CloneRepository clones the packages repository provided in a temporary
	// dir, returning the temporary directory path and the path where the
	// packages are located. It's the caller's responsibility to delete the
	// temporary dir when done.
	CloneRepository(ctx context.Context, r *Repository) (tmpDir string, packagesPath string, err error)
}

// RepositoryManager describes the methods an RepositoryManager
// implementation must provide.
type RepositoryManager interface {
	Add(ctx context.Context, orgName string, r *Repository) error
	CheckAvailability(ctx context.Context, resourceKind, value string) (bool, error)
	ClaimOwnership(ctx context.Context, name, orgName string) error
	Delete(ctx context.Context, name string) error
	GetAll(ctx context.Context, includeCredentials bool) ([]*Repository, error)
	GetAllJSON(ctx context.Context, includeCredentials bool) ([]byte, error)
	GetByID(ctx context.Context, repositorID string, includeCredentials bool) (*Repository, error)
	GetByKind(ctx context.Context, kind RepositoryKind, includeCredentials bool) ([]*Repository, error)
	GetByKindJSON(ctx context.Context, kind RepositoryKind, includeCredentials bool) ([]byte, error)
	GetByName(ctx context.Context, name string, includeCredentials bool) (*Repository, error)
	GetMetadata(mdFile string) (*RepositoryMetadata, error)
	GetPackagesDigest(ctx context.Context, repositoryID string) (map[string]string, error)
	GetOwnedByOrgJSON(ctx context.Context, orgName string, includeCredentials bool) ([]byte, error)
	GetOwnedByUserJSON(ctx context.Context, includeCredentials bool) ([]byte, error)
	SetLastTrackingResults(ctx context.Context, repositoryID, errs string) error
	SetVerifiedPublisher(ctx context.Context, repositorID string, verified bool) error
	Transfer(ctx context.Context, name, orgName string, ownershipClaim bool) error
	Update(ctx context.Context, r *Repository) error
}

// RepositoryMetadata represents some metadata about a given repository. It's
// usually provided by repositories publishers, to provide some extra context
// about the repository they'd like to publish.
type RepositoryMetadata struct {
	RepositoryID string   `yaml:"repositoryID"`
	Owners       []*Owner `yaml:"owners"`
}
