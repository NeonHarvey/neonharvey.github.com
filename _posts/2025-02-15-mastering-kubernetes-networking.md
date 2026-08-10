---
layout: post
title: "Mastering Kubernetes Networking: From CNI Plugins to Service Mesh Control"
date: 2025-02-15 10:00:00 +0000
category: "DevOps & Cloud"
tags: [kubernetes, networking, cloud, devops]
read_time: "8 min"
author: "Harvey"
excerpt: "An in-depth deep dive into the Kubernetes networking stack. We cover CNI plugin mechanics (Calico vs. Cilium), CoreDNS lookup mechanics, Ingress controllers, and Service Meshes."
---

Kubernetes networking is often considered one of the most complex components of the orchestrator. Unlike traditional VM platforms, Kubernetes coordinates independent container runtimes across dozens of physical nodes, each needing a unique, routable IP address.

To fully master Kubernetes deployments, we must demystify how pods communicate across nodes, how services route external traffic, and how microservices are governed.

---

## 1. The Foundation: Container Network Interface (CNI)

Every Pod in Kubernetes gets its own unique, routable IP address. This "IP-per-Pod" model simplifies port management and mimics virtual machines. The component responsible for provisioning these IPs and setting up the network namespaces is the **CNI Plugin**.

Popular CNIs include:
- **Calico**: Highly performant, uses BGP for routing, and supports advanced network policies.
- **Cilium**: The modern standard, powered by **eBPF** (Extended Berkeley Packet Filter), which bypasses iptables for ultra-low latency packet filtering and routing.
- **Flannel**: A simple overlay network (VXLAN) designed for easy setup but lacks network policy support.

### The eBPF Advantage with Cilium

Traditional CNIs rely on Linux `iptables` to route packets. However, as cluster sizes grow to hundreds of nodes and thousands of services, evaluating sequential `iptables` rules causes significant CPU overhead.

Cilium loads bytecode directly into the Linux kernel using **eBPF**, enabling O(1) packet lookup speeds and advanced kernel-level observability.

---

## 2. CoreDNS and Service Discovery

How do pods find each other? Kubernetes uses **CoreDNS** as its cluster-internal DNS server.

When a pod makes a DNS request for `my-service.prod.svc.cluster.local`, the resolution pathway follows these steps:
1. The pod queries its configured local nameserver (pointing to the CoreDNS Service IP, typically `10.96.0.10`).
2. CoreDNS checks its database (populated dynamically via the Kubernetes API).
3. CoreDNS returns the virtual **ClusterIP** of the service.
4. `kube-proxy` (running on each node) translates that virtual ClusterIP into a real target Pod IP using `iptables` or IPVS rules.

---

## 3. Ingress Controllers and API Gateways

While ClusterIPs handle internal pod-to-pod routing, how do we expose applications to the public internet?

```
Internet ---> [ LoadBalancer ] ---> [ Ingress Controller ] ---> [ Pod A / Pod B ]
```

An **Ingress Controller** acts as a reverse proxy (e.g., NGINX, Envoy, Traefik) that runs inside the cluster. It intercepts HTTP/HTTPS requests at the cluster boundary and routes them based on path or hostname rules.

### Configuring NGINX Ingress
Below is an example of an Ingress rule routing API traffic to a dedicated microservice:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: production
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: api.harvey-it.dev
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 8080
```

---

## 4. Service Meshes (Istio & Linkerd)

As microservices expand, developers require advanced networking features like mutual TLS (mTLS), canary traffic splitting, and deep distributed tracing. Rather than hardcoding these concerns into application code, we deploy a **Service Mesh**.

A Service Mesh splits the network architecture into two planes:
1. **Data Plane**: A lightweight sidecar proxy (usually Envoy) injected into each pod namespace that intercepts all inbound and outbound traffic.
2. **Control Plane**: A centralized component (like Istiod) that distributes configuration, certificates, and policies to all sidecars.

### Implementing a 90/10 Canary Split in Istio
With Istio, routing 10% of traffic to a new "v2" release is simple and decoupled from application code:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: recommendation-route
spec:
  hosts:
  - recommendation-service
  http:
  - route:
    - destination:
        host: recommendation-service
        subset: v1
      weight: 90
    - destination:
        host: recommendation-service
        subset: v2
      weight: 10
```

*By understanding CNI, CoreDNS, Ingress routing, and Service Meshes, you can build self-healing, highly observable, and secure Kubernetes architectures.*
