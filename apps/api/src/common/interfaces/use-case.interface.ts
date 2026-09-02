export interface UseCase<T, U> {
  execute(args: T): Promise<U>;
}
