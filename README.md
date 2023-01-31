# k8s-microservices-playground

This monorepo was created as a testing gound for me to play around with some new tools and patterns.

The current goal of this repo is to create a collection of asynchronous microservices running on Kubernetes.

The source files of every service is contained within separate folders located in the "apps" folder.

For now the project is intended to run on a local Kubernetes cluster using Docker Desktop. The project is using Kustomize to manage the Kubernetes manifests. 

# Run locally
To run the project locally you must first make sure Docker Desktop is running with Kubernetes enabled.

Then run "skaffold dev" from the root folder of this project.

This will create all the Kubernetes resources defined by the base Kubernetes manifests and the local Kustomize overlays.

Skaffold is currently configured to spin up all services with port-forwarding to local ports, so it is easy to work with local development tools such as Postman, DB administration tools etc. 

To further configure skaffold, edit the 'skaffold.yaml' file in the root folder.

Skaffold will automatically clean up and delete all resources when the process is killed.

# Deployment
The current setup has been designed to use ArgoCD for continous deployment.

A GitHub workflow for each micro service has been created. These workflows will run automated tests, rebuild and push new images of the individual services to DockerHub, whenever new changes has been comitted to the source files of these services.

After a new image has been pushed, the new image tag will replace the old image tag in the Kustomize overlay files. 

ArgoCD has been configured to detect changes in the Kustomize overlay files. ArgoCD will then automatically synchronize the Kubernetes cluster(s) to match the changed manifests.

Currently I'm just deploying to different namespaces on my local Kubernetes cluster to simulate different environments.

(The Kubernetes manifests for the ArgoCD operator will be added to the project in the future, but for now you will have to set that up manually if you want ArgoCD enabled)


