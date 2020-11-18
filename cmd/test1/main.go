package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/google/go-containerregistry/pkg/name"
	"github.com/google/go-containerregistry/pkg/v1/remote"
	"github.com/google/go-github/github"
)

func main() {
	oci()
	gh()
}

// OCI
func oci() {
	ref, err := name.ParseReference("ghcr.io/artifacthub/artifact-hub:0.2.0")
	if err != nil {
		log.Fatal(err)
	}
	desc, err := remote.Head(ref)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("%#v", desc)
}

// Github
func gh() {
	gh := github.NewClient(http.DefaultClient)
	ctx := context.Background()
	opt := &github.CommitsListOptions{
		ListOptions: github.ListOptions{
			Page:    0,
			PerPage: 1,
		},
	}
	commits, _, err := gh.Repositories.ListCommits(ctx, "artifacthub", "hub", opt)
	if err != nil {
		log.Fatal(err)
	}
	for _, commit := range commits {
		fmt.Println(*commit.SHA)
	}
}
