# k8s-microservices-playground

About
This mono repo was created as a play and testing gound, for me to play around with some new tools and patterns.

The current goal of this repo is to create a collection of asynchronous microservices running on Kubernetes.

The source files of every service is contained within separate folders located in the "apps" folder.

For now the project is intended to run on a local Kubernetes cluster using Docker Desktop. The project is using Kustomize to manage the Kubernetes manifests. 

Local development
To run the project locally you must first make sure Docker Desktop is running with Kubernetes enabled.
Then run "skaffold dev" from the root folder of this project.
This will create all the Kubernetes resources defined by the base Kubernetes manifests and the local Kustomize overlays.
Skaffold is currently configured to spin up all services with port-forwarding to local ports, so it is easily to work  with development tools such as Postman, DB admin tools etc. 
To further configure skaffold, edit the 'skaffold.yaml' file in the root folder.
Skaffold will automatically clean up and delete all resources when the process is killed.

Deployment
The there is a GitHub workflow for each micro service in the project. These workflows will rebuild and push new images of the various services to DockerHub,
whenever new changes has been comitted to the source files of said services.
After a new image has been pushed, the tag of thi swill replace the old image tag in the Kustomize overlay files. 




