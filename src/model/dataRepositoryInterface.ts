/**
 * An interface that represents a data repository that is used to gain
 * (and save) data.
 * This interface utilizes the caching mechanims of the application.
 *
 * @since 2.0.0
 */
export default interface DataRepositoryInterface<T> {
    /**
     * Load a specific model filled with data.
     * This function uses the caching functionalities
     * of the cache package to speed up loading time.
     */
    load(key: string): T;
}